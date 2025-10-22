/**
 * API Endpoint: POST /api/skill-gap/transferable-skills
 *
 * AI-powered transferable skills analysis using Claude/Anthropic API.
 * Server-side endpoint to avoid exposing API keys to clients.
 *
 * Task 2.3.4: Integrate with Anthropic Claude API (claude-3-5-sonnet model)
 * Task 5.2: Performance optimization with monitoring and graceful degradation
 * - Server-side API call to avoid exposing API keys
 * - Implement proper error handling and timeout (30 sec max)
 * - Cache AI responses by skill pair hash to reduce costs
 * - Track cache hit rates and AI analysis duration
 * - Graceful fallback to baseline matching on failure
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import { performanceMonitor } from '@/lib/utils/performance-monitor';
import { getUserFriendlyError, logError } from '@/lib/utils/error-recovery';

// Cache for AI responses (in-memory for MVP, should be Redis/DB in production)
const responseCache = new Map<string, {
  data: any;
  timestamp: number;
}>();

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const AI_TIMEOUT_MS = 30000; // 30 seconds

interface TransferableSkillsRequest {
  currentSkills: Array<{ name: string; level: string }>;
  targetSkills: Array<{
    skillName: string;
    skillCode: string;
    importance: number;
    level: number;
    category: string;
  }>;
  currentRole: string;
  targetRole: string;
  prompt: string;
}

/**
 * Generate cache key from request parameters
 */
function generateCacheKey(request: TransferableSkillsRequest): string {
  const { currentSkills, targetSkills, currentRole, targetRole } = request;

  const currentSkillsStr = currentSkills
    .map((s) => s.name.toLowerCase())
    .sort()
    .join(',');

  const targetSkillsStr = targetSkills
    .map((s) => s.skillName.toLowerCase())
    .sort()
    .join(',');

  return `${currentRole}|${targetRole}|${currentSkillsStr}|${targetSkillsStr}`;
}

/**
 * Clean up expired cache entries
 */
function cleanupExpiredCache(): void {
  const now = Date.now();
  const expiredKeys: string[] = [];

  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > CACHE_TTL_MS) {
      expiredKeys.push(key);
    }
  }

  expiredKeys.forEach((key) => responseCache.delete(key));

  if (expiredKeys.length > 0) {
    console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authenticate request using Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: TransferableSkillsRequest = await request.json();

    const {
      currentSkills,
      targetSkills,
      currentRole,
      targetRole,
      prompt,
    } = body;

    // Validate inputs
    if (!currentSkills || !Array.isArray(currentSkills) || currentSkills.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: currentSkills is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!targetSkills || !Array.isArray(targetSkills) || targetSkills.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: targetSkills is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!currentRole || !targetRole) {
      return NextResponse.json(
        { error: 'Invalid request: currentRole and targetRole are required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = generateCacheKey(body);
    const cachedResponse = responseCache.get(cacheKey);

    if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL_MS) {
      console.log('Returning cached transferable skills analysis');

      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric({
        operation: 'ai-transferable-skills',
        duration,
        success: true,
        cached: true,
      });
      performanceMonitor.trackAICache(true);

      return NextResponse.json({
        ...cachedResponse.data,
        cached: true,
      });
    }

    // Track cache miss
    performanceMonitor.trackAICache(false);

    // Initialize Anthropic client
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not configured');

      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric({
        operation: 'ai-transferable-skills',
        duration,
        success: false,
        error: 'API key not configured',
      });

      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey,
    });

    // Call Anthropic API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    try {
      // Optimize prompt by removing excessive detail from skills lists
      const optimizedPrompt = optimizePrompt(prompt, currentSkills, targetSkills);

      const response = await anthropic.messages.create(
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          temperature: 0.3,
          system: 'You are a career transition expert analyzing transferable skills.',
          messages: [
            {
              role: 'user',
              content: optimizedPrompt,
            },
          ],
        },
        {
          signal: controller.signal as AbortSignal,
        }
      );

      clearTimeout(timeoutId);

      // Extract and parse response
      const aiResponseText = response.content[0]?.type === 'text'
        ? response.content[0].text
        : '';

      // Try to parse JSON from response
      let parsedResponse;
      try {
        // Look for JSON in code blocks or plain text
        const jsonMatch = aiResponseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                         aiResponseText.match(/\{[\s\S]*\}/);

        const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponseText;
        parsedResponse = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);

        const duration = Date.now() - startTime;
        performanceMonitor.recordMetric({
          operation: 'ai-transferable-skills',
          duration,
          success: false,
          error: 'Invalid JSON response',
        });

        return NextResponse.json(
          { error: 'Invalid AI response format' },
          { status: 500 }
        );
      }

      // Validate response structure
      if (!parsedResponse.transferableSkills || !Array.isArray(parsedResponse.transferableSkills)) {
        console.warn('AI response missing transferableSkills array');
        parsedResponse = {
          transferableSkills: [],
          transferPatterns: [],
        };
      }

      // Normalize and validate transferable skills
      const validatedSkills = parsedResponse.transferableSkills
        .filter((skill: any) => {
          return (
            skill.skillName &&
            typeof skill.currentLevel === 'number' &&
            typeof skill.applicabilityToTarget === 'number' &&
            skill.transferRationale &&
            typeof skill.confidence === 'number'
          );
        })
        .map((skill: any) => ({
          skillName: skill.skillName,
          currentLevel: Math.max(0, Math.min(100, skill.currentLevel)),
          applicabilityToTarget: Math.max(0, Math.min(100, skill.applicabilityToTarget)),
          transferRationale: skill.transferRationale,
          confidence: Math.max(0, Math.min(1, skill.confidence)),
        }));

      const result = {
        transferableSkills: validatedSkills,
        transferPatterns: Array.isArray(parsedResponse.transferPatterns)
          ? parsedResponse.transferPatterns
          : [],
      };

      // Cache the response
      responseCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      // Cleanup expired cache entries periodically
      if (Math.random() < 0.1) { // 10% chance
        cleanupExpiredCache();
      }

      const duration = Date.now() - startTime;
      performanceMonitor.recordMetric({
        operation: 'ai-transferable-skills',
        duration,
        success: true,
        cached: false,
        metadata: {
          skillsAnalyzed: validatedSkills.length,
        },
      });

      return NextResponse.json({
        ...result,
        cached: false,
      });

    } catch (aiError: any) {
      clearTimeout(timeoutId);

      const duration = Date.now() - startTime;

      if (aiError.name === 'AbortError') {
        console.error('AI request timed out after 30 seconds');

        performanceMonitor.recordMetric({
          operation: 'ai-transferable-skills',
          duration,
          success: false,
          error: 'Timeout',
        });

        return NextResponse.json(
          { error: 'AI analysis timed out. Please try again.' },
          { status: 504 }
        );
      }

      performanceMonitor.recordMetric({
        operation: 'ai-transferable-skills',
        duration,
        success: false,
        error: aiError.message,
      });

      logError(aiError, {
        operation: 'ai-transferable-skills',
        userId,
      });

      console.error('Anthropic API error:', aiError);
      return NextResponse.json(
        { error: 'AI analysis failed', details: aiError.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    const duration = Date.now() - startTime;

    performanceMonitor.recordMetric({
      operation: 'ai-transferable-skills',
      duration,
      success: false,
      error: error.message,
    });

    const friendlyError = getUserFriendlyError(error, {
      operation: 'ai-transferable-skills',
    });

    logError(error, {
      operation: 'ai-transferable-skills',
    });

    console.error('Transferable skills analysis error:', error);
    return NextResponse.json(
      {
        error: friendlyError.title,
        message: friendlyError.message,
        action: friendlyError.action,
        technical: friendlyError.technical,
      },
      { status: 500 }
    );
  }
}

/**
 * Optimize AI prompt by compressing skill lists
 * Reduces token count while preserving essential information
 */
function optimizePrompt(
  prompt: string,
  currentSkills: Array<{ name: string; level: string }>,
  targetSkills: Array<any>
): string {
  // Limit skills to top 20 for each category to reduce prompt size
  const maxSkills = 20;

  const truncatedCurrentSkills = currentSkills.slice(0, maxSkills);
  const truncatedTargetSkills = targetSkills
    .sort((a, b) => b.importance - a.importance) // Sort by importance
    .slice(0, maxSkills);

  // Replace skill lists in prompt with truncated versions
  let optimizedPrompt = prompt;

  // Replace current skills list
  const currentSkillsList = truncatedCurrentSkills
    .map(s => `- ${s.name} (${s.level})`)
    .join('\n');

  const targetSkillsList = truncatedTargetSkills
    .map(s => `- ${s.skillName} (Importance: ${s.importance}/100)`)
    .join('\n');

  // Update prompt with truncated lists
  optimizedPrompt = optimizedPrompt.replace(
    /CURRENT ROLE SKILLS:[\s\S]*?TARGET ROLE:/,
    `CURRENT ROLE SKILLS:\n${currentSkillsList}\n\nTARGET ROLE:`
  );

  optimizedPrompt = optimizedPrompt.replace(
    /TARGET ROLE REQUIREMENTS \(from O\*NET\):[\s\S]*?For each/,
    `TARGET ROLE REQUIREMENTS (from O*NET):\n${targetSkillsList}\n\nFor each`
  );

  return optimizedPrompt;
}
