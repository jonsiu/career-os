import {
  ONetProvider,
  OccupationSearchResult,
  OccupationSkills,
  ONetSkill,
  ONetKnowledge,
  ONetAbility,
} from '../types';
import { api } from '@/lib/convex-client';
import { ConvexHttpClient } from 'convex/browser';
import { performanceMonitor } from '@/lib/utils/performance-monitor';
import { batchProcess } from '@/lib/utils/error-recovery';

/**
 * O*NET Provider Implementation
 *
 * Integrates with O*NET Web Services API to retrieve occupational data.
 * Implements caching layer using Convex database to reduce redundant API calls.
 * Handles rate limiting (5 requests/second) and fallback to cached data.
 *
 * Performance optimizations (Task 5.2.1):
 * - Batch O*NET API requests where possible (multi-skill lookup)
 * - Track cache hit rates and API response times
 * - Implement parallel batching for multiple occupation lookups
 */
export class ONetProviderImpl implements ONetProvider {
  private readonly convexClient: ConvexHttpClient;
  private readonly onetApiBase = 'https://services.onetcenter.org/ws';
  private readonly onetApiVersion = 'v1';
  private readonly rateLimitDelay = 200; // 5 requests/second = 200ms between requests
  private lastRequestTime = 0;

  constructor() {
    // Initialize Convex client for cache operations
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL environment variable is not set');
    }
    this.convexClient = new ConvexHttpClient(convexUrl);
  }

  /**
   * Enforce rate limiting (5 requests/second)
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Make authenticated request to O*NET API
   */
  private async fetchFromONet(endpoint: string): Promise<any> {
    const startTime = Date.now();
    await this.enforceRateLimit();

    const username = process.env.ONET_API_USERNAME;
    const password = process.env.ONET_API_PASSWORD;

    if (!username || !password) {
      console.warn('O*NET API credentials not configured, using mock data');
      return null;
    }

    try {
      const url = `${this.onetApiBase}/${this.onetApiVersion}${endpoint}`;
      const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

      const response = await fetch(url, {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`O*NET API error: ${response.status} ${response.statusText}`);
        performanceMonitor.recordMetric({
          operation: 'onet-api-request',
          duration: Date.now() - startTime,
          success: false,
          error: `${response.status} ${response.statusText}`,
        });
        return null;
      }

      performanceMonitor.recordMetric({
        operation: 'onet-api-request',
        duration: Date.now() - startTime,
        success: true,
      });

      return await response.json();
    } catch (error) {
      console.error('O*NET API request failed:', error);
      performanceMonitor.recordMetric({
        operation: 'onet-api-request',
        duration: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Search occupations by query string
   */
  async searchOccupations(query: string): Promise<OccupationSearchResult[]> {
    try {
      // Try to search in cache first
      const cachedResults = await this.convexClient.query(api.onetCache.searchOccupations, {
        query,
      });

      if (cachedResults && cachedResults.length > 0) {
        console.log(`Found ${cachedResults.length} cached occupations for query: ${query}`);
        performanceMonitor.trackONetCache(true);
        return cachedResults.map(cached => ({
          code: cached.occupationCode,
          title: cached.occupationTitle,
          description: `${cached.skills.length} skills, ${cached.knowledgeAreas.length} knowledge areas`,
        }));
      }

      performanceMonitor.trackONetCache(false);

      // Fall back to O*NET API if not in cache
      const data = await this.fetchFromONet(`/online/search?keyword=${encodeURIComponent(query)}`);

      if (!data || !data.occupation) {
        console.log('No O*NET API results, returning empty array');
        return [];
      }

      // Map O*NET response to our format
      const results: OccupationSearchResult[] = data.occupation.map((occ: any) => ({
        code: occ.code,
        title: occ.title,
        description: occ.description,
      }));

      return results.slice(0, 20); // Limit to 20 results
    } catch (error) {
      console.error('Error searching occupations:', error);
      return [];
    }
  }

  /**
   * Get detailed occupation skills and requirements
   */
  async getOccupationSkills(code: string): Promise<OccupationSkills> {
    try {
      // Check cache first
      const cached = await this.getCachedOccupation(code);
      if (cached) {
        console.log(`Using cached occupation data for code: ${code}`);
        performanceMonitor.trackONetCache(true);
        return cached;
      }

      performanceMonitor.trackONetCache(false);

      // Fetch from O*NET API - batch related requests
      const [occupationData, skillsData, knowledgeData, abilitiesData] = await Promise.all([
        this.fetchFromONet(`/online/occupations/${code}`),
        this.fetchFromONet(`/online/occupations/${code}/skills`),
        this.fetchFromONet(`/online/occupations/${code}/knowledge`),
        this.fetchFromONet(`/online/occupations/${code}/abilities`),
      ]);

      if (!occupationData) {
        throw new Error(`Occupation ${code} not found in O*NET`);
      }

      // Parse and structure the data
      const skills: ONetSkill[] = (skillsData?.skill || []).map((skill: any) => ({
        skillName: skill.element_name,
        skillCode: skill.element_id,
        importance: this.normalizeImportance(skill.im_value || skill.value),
        level: this.normalizeLevel(skill.lv_value || skill.scale_value),
        category: skill.element_id.startsWith('2.A') ? 'Basic Skills' : 'Technical Skills',
      }));

      const knowledgeAreas: ONetKnowledge[] = (knowledgeData?.knowledge || []).map((knowledge: any) => ({
        name: knowledge.element_name,
        level: this.normalizeLevel(knowledge.lv_value || knowledge.scale_value),
        importance: this.normalizeImportance(knowledge.im_value || knowledge.value),
      }));

      const abilities: ONetAbility[] = (abilitiesData?.ability || []).map((ability: any) => ({
        name: ability.element_name,
        level: this.normalizeLevel(ability.lv_value || ability.scale_value),
        importance: this.normalizeImportance(ability.im_value || ability.value),
      }));

      const occupationSkills: OccupationSkills = {
        occupationCode: code,
        occupationTitle: occupationData.title,
        skills,
        knowledgeAreas,
        abilities,
        laborMarketData: {
          employmentOutlook: 'Average', // O*NET API doesn't provide this directly
          medianSalary: undefined,
          growthRate: undefined,
        },
        cacheVersion: '29.0', // Current O*NET database version
      };

      // Cache the result
      await this.cacheOccupation(code, occupationSkills);

      return occupationSkills;
    } catch (error) {
      console.error(`Error fetching occupation skills for ${code}:`, error);

      // Return mock data if API fails
      return this.getMockOccupationSkills(code);
    }
  }

  /**
   * Batch fetch multiple occupations (Task 5.2.1 - Performance optimization)
   *
   * Optimizes performance by batching O*NET requests and checking cache first.
   * Processes uncached items in parallel batches to respect rate limits.
   *
   * @param codes - Array of O*NET occupation codes
   * @returns Array of occupation skills in same order as input codes
   */
  async batchGetOccupationSkills(codes: string[]): Promise<OccupationSkills[]> {
    console.log(`Batch fetching ${codes.length} occupations`);

    // First, try to get all from cache
    const cachedPromises = codes.map(code => this.getCachedOccupation(code));
    const cachedResults = await Promise.all(cachedPromises);

    // Identify which codes need to be fetched from API
    const uncachedCodes = codes.filter((code, index) => !cachedResults[index]);
    console.log(`Found ${codes.length - uncachedCodes.length} cached, fetching ${uncachedCodes.length} from API`);

    if (uncachedCodes.length === 0) {
      // All cached, track hits
      codes.forEach(() => performanceMonitor.trackONetCache(true));
      return cachedResults.filter(Boolean) as OccupationSkills[];
    }

    // Track cache hits and misses
    codes.forEach((code, index) => {
      performanceMonitor.trackONetCache(!!cachedResults[index]);
    });

    // Batch fetch uncached items (5 per batch to respect rate limit)
    const batchSize = 5;
    const fetchedResults = await batchProcess(
      uncachedCodes,
      batchSize,
      async (batch) => {
        return Promise.all(batch.map(code => this.getOccupationSkills(code)));
      },
      false // Sequential batches to respect rate limiting
    );

    // Flatten batched results
    const flatFetchedResults = fetchedResults.flat();

    // Merge cached and fetched results in original order
    const results: OccupationSkills[] = [];
    let fetchedIndex = 0;

    for (let i = 0; i < codes.length; i++) {
      if (cachedResults[i]) {
        results.push(cachedResults[i] as OccupationSkills);
      } else {
        results.push(flatFetchedResults[fetchedIndex]);
        fetchedIndex++;
      }
    }

    return results;
  }

  /**
   * Batch fetch skill complexities (Task 5.2.1 - Performance optimization)
   *
   * @param skillCodes - Array of skill codes to fetch
   * @returns Array of complexity values (0-100) in same order
   */
  async batchGetSkillComplexities(skillCodes: string[]): Promise<number[]> {
    console.log(`Batch fetching complexities for ${skillCodes.length} skills`);

    // Process in batches to respect rate limits
    const batchSize = 5;
    const results = await batchProcess(
      skillCodes,
      batchSize,
      async (batch) => {
        return Promise.all(batch.map(code => this.getSkillComplexity(code)));
      },
      false // Sequential batches
    );

    return results.flat();
  }

  /**
   * Get skill complexity/level from O*NET
   */
  async getSkillComplexity(skillCode: string): Promise<number> {
    try {
      const data = await this.fetchFromONet(`/online/skills/${skillCode}`);

      if (!data) {
        // Default complexity if API fails
        return 50;
      }

      // Extract level value (0-7 scale) and normalize to 0-100
      const level = data.level || data.scale_value || 3.5;
      return this.normalizeLevel(level);
    } catch (error) {
      console.error(`Error fetching skill complexity for ${skillCode}:`, error);
      return 50; // Default to medium complexity
    }
  }

  /**
   * Get cached occupation data if available and not expired
   */
  async getCachedOccupation(code: string): Promise<OccupationSkills | null> {
    try {
      const cached = await this.convexClient.query(api.onetCache.getValidCache, { code });

      if (!cached) {
        return null;
      }

      // Map cached data to OccupationSkills format
      return {
        occupationCode: cached.occupationCode,
        occupationTitle: cached.occupationTitle,
        skills: cached.skills,
        knowledgeAreas: cached.knowledgeAreas,
        abilities: cached.abilities,
        laborMarketData: cached.laborMarketData,
        cacheVersion: cached.cacheVersion,
      };
    } catch (error) {
      console.error(`Error retrieving cached occupation ${code}:`, error);
      return null;
    }
  }

  /**
   * Cache occupation data for future use (30-day TTL)
   */
  async cacheOccupation(code: string, data: OccupationSkills): Promise<void> {
    try {
      await this.convexClient.mutation(api.onetCache.cacheOccupation, {
        occupationCode: data.occupationCode,
        occupationTitle: data.occupationTitle,
        skills: data.skills,
        knowledgeAreas: data.knowledgeAreas,
        abilities: data.abilities,
        laborMarketData: data.laborMarketData,
        cacheVersion: data.cacheVersion,
      });

      console.log(`Cached occupation data for ${code} (30-day TTL)`);
    } catch (error) {
      console.error(`Error caching occupation ${code}:`, error);
      // Don't throw - caching failure shouldn't break the flow
    }
  }

  /**
   * Normalize O*NET importance value (1-5 scale) to 1-100
   */
  private normalizeImportance(value: number): number {
    // O*NET importance scale: 1 (Not Important) to 5 (Extremely Important)
    // Map to 1-100 scale
    return Math.round((value / 5) * 100);
  }

  /**
   * Normalize O*NET level value (0-7 scale) to 0-100
   */
  private normalizeLevel(value: number): number {
    // O*NET level scale: 0 to 7
    // Map to 0-100 scale
    return Math.round((value / 7) * 100);
  }

  /**
   * Provide mock occupation skills data for fallback scenarios
   */
  private getMockOccupationSkills(code: string): OccupationSkills {
    return {
      occupationCode: code,
      occupationTitle: 'Software Developer',
      skills: [
        {
          skillName: 'Programming',
          skillCode: '2.B.5.a',
          importance: 90,
          level: 71, // Level 5 on 0-7 scale
          category: 'Technical Skills',
        },
        {
          skillName: 'Critical Thinking',
          skillCode: '2.A.2.a',
          importance: 85,
          level: 71,
          category: 'Basic Skills',
        },
        {
          skillName: 'Complex Problem Solving',
          skillCode: '2.A.2.b',
          importance: 85,
          level: 71,
          category: 'Basic Skills',
        },
      ],
      knowledgeAreas: [
        {
          name: 'Computers and Electronics',
          level: 85,
          importance: 90,
        },
        {
          name: 'Engineering and Technology',
          level: 71,
          importance: 80,
        },
      ],
      abilities: [
        {
          name: 'Deductive Reasoning',
          level: 71,
          importance: 85,
        },
        {
          name: 'Information Ordering',
          level: 71,
          importance: 80,
        },
      ],
      laborMarketData: {
        employmentOutlook: 'Bright',
        medianSalary: 120000,
        growthRate: 22,
      },
      cacheVersion: '29.0',
    };
  }
}
