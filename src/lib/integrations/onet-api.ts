/**
 * O*NET API Integration
 *
 * O*NET (Occupational Information Network) provides detailed skill requirements
 * and job-to-skill mappings for career analysis.
 *
 * API Documentation: https://services.onetcenter.org/reference/
 * Free tier limit: 1000 calls/day
 */

const ONET_API_KEY = process.env.ONET_API_KEY || '';
const ONET_BASE_URL = 'https://services.onetcenter.org/ws';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// In-memory cache to stay within free tier limits
const cache = new Map<string, { data: any; timestamp: number }>();

interface ONetSkillValidation {
  valid: boolean;
  code?: string;
  importance?: number;
  level?: number;
}

interface ONetSkillRequirements {
  level: string;
  importance: number;
}

/**
 * Validate a skill against O*NET database
 * Returns skill code and importance rating if found
 */
export async function validateSkill(skillName: string): Promise<ONetSkillValidation | null> {
  if (!ONET_API_KEY) {
    console.warn('O*NET API key not configured');
    return null;
  }

  const cacheKey = `validate:${skillName}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Search for skill in O*NET skills database
    const response = await fetch(
      `${ONET_BASE_URL}/online/search?keyword=${encodeURIComponent(skillName)}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${ONET_API_KEY}:`).toString('base64')}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`O*NET API error: ${response.status}`);
    }

    const data = await response.json();

    // Check if skill was found
    if (data.occupation && data.occupation.length > 0) {
      const skill = data.occupation[0];
      const validation: ONetSkillValidation = {
        valid: true,
        code: skill.code,
        importance: 4.0, // Default importance (will be refined with more detailed API call)
      };

      cache.set(cacheKey, { data: validation, timestamp: Date.now() });
      return validation;
    }

    const notFound: ONetSkillValidation = { valid: false };
    cache.set(cacheKey, { data: notFound, timestamp: Date.now() });
    return notFound;

  } catch (error) {
    console.error('O*NET skill validation error:', error);
    throw error; // Let caller handle graceful degradation
  }
}

/**
 * Get skill requirements for a specific occupation
 * Returns importance and level ratings
 */
export async function getSkillRequirements(
  occupationCode: string,
  skillName: string
): Promise<ONetSkillRequirements | null> {
  if (!ONET_API_KEY) {
    console.warn('O*NET API key not configured');
    return null;
  }

  const cacheKey = `requirements:${occupationCode}:${skillName}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Get skills for occupation
    const response = await fetch(
      `${ONET_BASE_URL}/online/occupations/${occupationCode}/summary/skills`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${ONET_API_KEY}:`).toString('base64')}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`O*NET API error: ${response.status}`);
    }

    const data = await response.json();

    // Find the specific skill
    const skill = data.skill?.find(
      (s: any) => s.name?.toLowerCase().includes(skillName.toLowerCase())
    );

    if (skill) {
      const requirements: ONetSkillRequirements = {
        level: mapLevelToCategory(skill.level?.value || 3),
        importance: skill.importance?.value || 3.0,
      };

      cache.set(cacheKey, { data: requirements, timestamp: Date.now() });
      return requirements;
    }

    return null;

  } catch (error) {
    console.error('O*NET skill requirements error:', error);
    throw error; // Let caller handle graceful degradation
  }
}

/**
 * Search for occupations by keyword
 */
export async function searchOccupations(keyword: string): Promise<any[]> {
  if (!ONET_API_KEY) {
    console.warn('O*NET API key not configured');
    return [];
  }

  const cacheKey = `search:${keyword}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `${ONET_BASE_URL}/online/search?keyword=${encodeURIComponent(keyword)}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${ONET_API_KEY}:`).toString('base64')}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`O*NET API error: ${response.status}`);
    }

    const data = await response.json();
    const occupations = data.occupation || [];

    cache.set(cacheKey, { data: occupations, timestamp: Date.now() });
    return occupations;

  } catch (error) {
    console.error('O*NET occupation search error:', error);
    throw error;
  }
}

/**
 * Get skill importance for an occupation
 * Higher values (3.5-5.0) indicate critical skills
 */
export async function getOccupationSkills(occupationCode: string): Promise<any[]> {
  if (!ONET_API_KEY) {
    console.warn('O*NET API key not configured');
    return [];
  }

  const cacheKey = `skills:${occupationCode}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `${ONET_BASE_URL}/online/occupations/${occupationCode}/summary/skills`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${ONET_API_KEY}:`).toString('base64')}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`O*NET API error: ${response.status}`);
    }

    const data = await response.json();
    const skills = data.skill || [];

    cache.set(cacheKey, { data: skills, timestamp: Date.now() });
    return skills;

  } catch (error) {
    console.error('O*NET occupation skills error:', error);
    throw error;
  }
}

/**
 * Map O*NET numeric level to category
 */
function mapLevelToCategory(level: number): string {
  if (level >= 5) return 'advanced';
  if (level >= 3) return 'intermediate';
  return 'basic';
}

/**
 * Clear the cache (useful for testing or manual refresh)
 */
export function clearONetCache(): void {
  cache.clear();
}

/**
 * Get cache statistics (for monitoring)
 */
export function getONetCacheStats() {
  return {
    size: cache.size,
    entries: Array.from(cache.keys()),
  };
}
