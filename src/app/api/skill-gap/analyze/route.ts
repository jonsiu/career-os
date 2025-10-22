import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/nextjs';
import { api } from '@/lib/convex-client';
import { SkillGapAnalyzer } from '@/lib/services/skill-gap-analyzer';
import { TransferableSkillsMatcher } from '@/lib/services/transferable-skills-matcher';
import { ONetProviderImpl } from '@/lib/abstractions/providers/onet-provider';
import { ConvexAnalysisProvider } from '@/lib/abstractions/providers/convex-analysis';
import { generateContentHash } from '@/lib/utils/content-hash';
import { performanceMonitor } from '@/lib/utils/performance-monitor';
import {
  getUserFriendlyError,
  withFallback,
  retryWithBackoff,
  isRetryableError,
  logError,
} from '@/lib/utils/error-recovery';

/**
 * POST /api/skill-gap/analyze
 *
 * Analyze skill gaps between user's resume and target role requirements.
 * Uses content hashing for cache invalidation to avoid redundant analyses.
 *
 * Performance optimizations (Task 5.2):
 * - Performance monitoring with target validation (<10s initial, <30s AI)
 * - Graceful error handling with fallback mechanisms
 * - Batch O*NET requests where possible
 * - Cache hit rate tracking (target >85%)
 *
 * Input:
 * - resumeId: Resume document ID
 * - targetRole: Target role title (e.g., "Software Developer")
 * - targetRoleONetCode: Optional O*NET SOC code (e.g., "15-1252.00")
 * - userAvailability: Hours per week user can dedicate to learning
 *
 * Output:
 * - analysisId: Created analysis document ID
 * - criticalGaps: Must-have skills user is missing
 * - niceToHaveGaps: Beneficial but not critical skills
 * - transferableSkills: Skills from resume that apply to target role
 * - roadmap: Prioritized learning roadmap with phases
 * - cached: Boolean indicating if result was from cache
 * - warnings: Array of user-friendly warnings for any fallbacks used
 */
export async function POST(request: NextRequest) {
  // Start performance tracking for overall analysis
  const startTime = Date.now();
  const warnings: Array<{ title: string; message: string; action: string }> = [];

  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const { resumeId, targetRole, targetRoleONetCode, userAvailability } = body;

    if (!resumeId || !targetRole || !userAvailability) {
      return NextResponse.json(
        { error: 'Missing required fields: resumeId, targetRole, and userAvailability are required' },
        { status: 400 }
      );
    }

    if (typeof userAvailability !== 'number' || userAvailability <= 0) {
      return NextResponse.json(
        { error: 'userAvailability must be a positive number' },
        { status: 400 }
      );
    }

    // 3. Initialize providers and services
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL environment variable is not set');
    }

    const convex = new ConvexHttpClient(convexUrl);
    const skillGapAnalyzer = new SkillGapAnalyzer();
    const transferableMatcher = new TransferableSkillsMatcher();
    const onetProvider = new ONetProviderImpl();
    const analysisProvider = new ConvexAnalysisProvider();

    // 4. Get user from Convex with performance tracking
    const userQueryStart = Date.now();
    const user = await convex.query(api.users.getByClerkUserId, { clerkUserId: userId });
    performanceMonitor.recordMetric({
      operation: 'convex-query-user',
      duration: Date.now() - userQueryStart,
      success: !!user,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 5. Get resume from Convex with performance tracking
    const resumeQueryStart = Date.now();
    const resume = await convex.query(api.resumes.getById, { resumeId });
    performanceMonitor.recordMetric({
      operation: 'convex-query-resume',
      duration: Date.now() - resumeQueryStart,
      success: !!resume,
    });

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    // 6. Calculate content hash for cache lookup
    const contentHash = await generateContentHash(resume);

    // 7. Check cache for existing analysis
    const cacheQueryStart = Date.now();
    const cachedAnalysis = await convex.query(api.skillGapAnalyses.getByContentHash, {
      resumeId,
      contentHash,
      targetRole,
    });
    performanceMonitor.recordMetric({
      operation: 'convex-query-analysis-cache',
      duration: Date.now() - cacheQueryStart,
      success: true,
      cached: !!cachedAnalysis,
    });

    if (cachedAnalysis) {
      console.log(`Using cached skill gap analysis: ${cachedAnalysis._id}`);

      // Record successful cache hit
      const totalDuration = Date.now() - startTime;
      performanceMonitor.recordMetric({
        operation: 'initial-analysis',
        duration: totalDuration,
        success: true,
        cached: true,
      });

      return NextResponse.json({
        success: true,
        cached: true,
        analysisId: cachedAnalysis._id,
        criticalGaps: cachedAnalysis.criticalGaps,
        niceToHaveGaps: cachedAnalysis.niceToHaveGaps,
        transferableSkills: cachedAnalysis.transferableSkills,
        roadmap: cachedAnalysis.prioritizedRoadmap,
        completionProgress: cachedAnalysis.completionProgress,
        transitionType: cachedAnalysis.transitionType,
      });
    }

    // 8. Extract skills from resume
    console.log('Extracting skills from resume...');
    const parsedResume = await analysisProvider.parseResumeContent(resume.content);
    const resumeSkills = parsedResume.skills.map((skill: any) => ({
      name: skill.name,
      level: skill.level || 'intermediate',
    }));

    // 9. Fetch target role requirements from O*NET with retry and fallback
    console.log(`Fetching O*NET data for role: ${targetRole}`);
    const onetStart = Date.now();
    let occupationSkills;

    try {
      occupationSkills = await withFallback({
        operation: async () => {
          return await retryWithBackoff(
            async () => {
              if (targetRoleONetCode) {
                return await onetProvider.getOccupationSkills(targetRoleONetCode);
              } else {
                const searchResults = await onetProvider.searchOccupations(targetRole);
                if (searchResults.length === 0) {
                  throw new Error(`No O*NET occupation found for role: ${targetRole}`);
                }
                return await onetProvider.getOccupationSkills(searchResults[0].code);
              }
            },
            {
              maxAttempts: 2,
              initialDelayMs: 1000,
              shouldRetry: isRetryableError,
            }
          );
        },
        fallback: async () => {
          // Try to get cached data as fallback
          console.warn('O*NET API unavailable, attempting to use cached data');
          const cached = targetRoleONetCode
            ? await onetProvider.getCachedOccupation(targetRoleONetCode)
            : null;

          if (cached) {
            warnings.push({
              title: 'Using cached occupation data',
              message: 'We\'re using previously cached occupation data because the O*NET service is temporarily unavailable.',
              action: 'Your analysis will continue with available information.',
            });
            performanceMonitor.trackONetCache(true);
            return cached;
          }

          throw new Error('O*NET data unavailable and no cache exists');
        },
        operationName: 'onet-fetch-occupation',
        warnUser: true,
      });

      performanceMonitor.recordMetric({
        operation: 'onet-api-fetch',
        duration: Date.now() - onetStart,
        success: true,
      });
      performanceMonitor.trackONetCache(false); // Miss if we got here

    } catch (error) {
      const friendlyError = getUserFriendlyError(error, {
        operation: 'onet-fetch-occupation',
        userId,
      });

      performanceMonitor.recordMetric({
        operation: 'onet-api-fetch',
        duration: Date.now() - onetStart,
        success: false,
        error: friendlyError.technical,
      });

      logError(error, {
        operation: 'onet-fetch-occupation',
        userId,
      });

      return NextResponse.json(
        {
          error: friendlyError.title,
          message: friendlyError.message,
          action: friendlyError.action,
          technical: friendlyError.technical,
        },
        { status: 404 }
      );
    }

    // 10. Analyze skill gaps
    console.log('Analyzing skill gaps...');
    const gapAnalysis = skillGapAnalyzer.analyzeGap(
      resumeSkills,
      occupationSkills.skills.map(skill => ({
        skillName: skill.skillName,
        skillCode: skill.skillCode,
        importance: skill.importance,
        level: skill.level,
        category: skill.category,
      })),
      userAvailability
    );

    // 11. Calculate learning velocity from user's Skills Tracker history
    const userSkills = await convex.query(api.skills.getByUserId, { userId: user._id });
    const learningVelocity = skillGapAnalyzer.calculateLearningVelocity(userSkills);

    // 12. Prioritize gaps using multi-factor algorithm
    console.log('Prioritizing skill gaps...');
    const prioritizedCriticalGaps = skillGapAnalyzer.prioritizeGaps(
      gapAnalysis.criticalGaps,
      learningVelocity
    );
    const prioritizedNiceToHaveGaps = skillGapAnalyzer.prioritizeGaps(
      gapAnalysis.niceToHaveGaps,
      learningVelocity
    );

    // 13. Run AI transferable skills analysis with fallback to baseline
    console.log('Analyzing transferable skills with AI...');
    const currentRole = parsedResume.experience.length > 0
      ? parsedResume.experience[0].title
      : 'Current Role';

    const aiStart = Date.now();
    const transferableSkillsResult = await withFallback({
      operation: async () => {
        const result = await transferableMatcher.findTransferableSkills(
          resumeSkills,
          occupationSkills.skills,
          currentRole,
          targetRole
        );

        performanceMonitor.recordMetric({
          operation: 'ai-transferable-skills',
          duration: Date.now() - aiStart,
          success: true,
        });
        performanceMonitor.trackAICache(false); // Assume miss unless explicitly cached

        return result;
      },
      fallback: () => {
        warnings.push({
          title: 'Using baseline skill matching',
          message: 'Advanced AI analysis was unavailable, so we used rule-based skill matching instead.',
          action: 'Your analysis is still accurate, but may not include advanced skill transfer insights.',
        });

        performanceMonitor.recordMetric({
          operation: 'ai-transferable-skills',
          duration: Date.now() - aiStart,
          success: false,
          error: 'AI analysis failed, using baseline',
        });

        // Fall back to baseline O*NET matching
        const baselineSkills = transferableMatcher.detectONetBaseline(
          resumeSkills,
          occupationSkills.skills
        );

        return {
          transferableSkills: baselineSkills,
          transferPatterns: baselineSkills.length > 0 ? ['Direct skill overlap'] : [],
        };
      },
      operationName: 'ai-transferable-skills-analysis',
      warnUser: true,
    });

    // 14. Generate prioritized learning roadmap
    console.log('Generating learning roadmap...');
    const allPrioritizedGaps = [
      ...prioritizedCriticalGaps,
      ...prioritizedNiceToHaveGaps,
    ];
    const roadmap = skillGapAnalyzer.generateRoadmap(allPrioritizedGaps, userAvailability);

    // 15. Determine transition type based on role similarity
    const transitionType = determineTransitionType(
      currentRole,
      targetRole,
      prioritizedCriticalGaps.length,
      transferableSkillsResult.transferableSkills.length
    );

    // 16. Save analysis to database with retry
    console.log('Saving analysis to database...');
    const saveStart = Date.now();

    try {
      const analysisId = await retryWithBackoff(
        async () => {
          return await convex.mutation(api.skillGapAnalyses.create, {
            userId: user._id,
            resumeId,
            targetRole,
            targetRoleONetCode: occupationSkills.occupationCode,
            criticalGaps: prioritizedCriticalGaps.map(gap => ({
              skillName: gap.skillName,
              onetCode: gap.onetCode,
              importance: gap.importance * 100,
              currentLevel: gap.currentLevel,
              targetLevel: gap.targetLevel,
              priorityScore: gap.priorityScore,
              timeEstimate: gap.timeToAcquire,
              marketDemand: gap.marketDemand * 100,
            })),
            niceToHaveGaps: prioritizedNiceToHaveGaps.map(gap => ({
              skillName: gap.skillName,
              onetCode: gap.onetCode,
              importance: gap.importance * 100,
              currentLevel: gap.currentLevel,
              targetLevel: gap.targetLevel,
              priorityScore: gap.priorityScore,
              timeEstimate: gap.timeToAcquire,
            })),
            transferableSkills: transferableSkillsResult.transferableSkills.map(skill => ({
              skillName: skill.skillName,
              currentLevel: skill.currentLevel,
              applicability: skill.applicabilityToTarget,
              transferExplanation: skill.transferRationale,
              confidence: skill.confidence,
            })),
            prioritizedRoadmap: roadmap,
            userAvailability,
            transitionType,
            completionProgress: 0,
            contentHash,
            analysisVersion: '1.0',
            metadata: {
              onetDataVersion: occupationSkills.cacheVersion,
              aiModel: 'claude-3-5-sonnet',
              affiliateClickCount: 0,
              lastProgressUpdate: Date.now(),
            },
          });
        },
        {
          maxAttempts: 3,
          initialDelayMs: 500,
          shouldRetry: isRetryableError,
        }
      );

      performanceMonitor.recordMetric({
        operation: 'convex-mutation-save-analysis',
        duration: Date.now() - saveStart,
        success: true,
      });

      // Record total analysis duration
      const totalDuration = Date.now() - startTime;
      performanceMonitor.recordMetric({
        operation: 'initial-analysis',
        duration: totalDuration,
        success: true,
        cached: false,
        metadata: {
          criticalGaps: prioritizedCriticalGaps.length,
          niceToHaveGaps: prioritizedNiceToHaveGaps.length,
          transferableSkills: transferableSkillsResult.transferableSkills.length,
        },
      });

      // 17. Return analysis results
      return NextResponse.json({
        success: true,
        cached: false,
        analysisId,
        criticalGaps: prioritizedCriticalGaps,
        niceToHaveGaps: prioritizedNiceToHaveGaps,
        transferableSkills: transferableSkillsResult.transferableSkills,
        roadmap,
        completionProgress: 0,
        transitionType,
        warnings: warnings.length > 0 ? warnings : undefined,
        metadata: {
          learningVelocity,
          totalGaps: prioritizedCriticalGaps.length + prioritizedNiceToHaveGaps.length,
          totalTransferableSkills: transferableSkillsResult.transferableSkills.length,
          analysisTime: totalDuration,
        },
      });

    } catch (saveError) {
      performanceMonitor.recordMetric({
        operation: 'convex-mutation-save-analysis',
        duration: Date.now() - saveStart,
        success: false,
        error: saveError instanceof Error ? saveError.message : 'Unknown error',
      });

      const friendlyError = getUserFriendlyError(saveError, {
        operation: 'save-analysis',
        userId,
      });

      logError(saveError, {
        operation: 'save-analysis',
        userId,
      });

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

  } catch (error) {
    // Record failed analysis
    const totalDuration = Date.now() - startTime;
    performanceMonitor.recordMetric({
      operation: 'initial-analysis',
      duration: totalDuration,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    const friendlyError = getUserFriendlyError(error, {
      operation: 'skill-gap-analysis',
    });

    logError(error, {
      operation: 'skill-gap-analysis',
    });

    console.error('Skill gap analysis error:', error);

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
 * Determine transition type based on role similarity and gap analysis
 */
function determineTransitionType(
  currentRole: string,
  targetRole: string,
  criticalGapsCount: number,
  transferableSkillsCount: number
): 'lateral' | 'upward' | 'career-change' {
  // Simple heuristic based on gap count and transferable skills
  const gapRatio = transferableSkillsCount > 0
    ? criticalGapsCount / transferableSkillsCount
    : criticalGapsCount;

  if (gapRatio > 2.0) {
    // Many gaps, few transferable skills = career change
    return 'career-change';
  } else if (gapRatio > 1.0) {
    // More gaps than transferable = upward transition
    return 'upward';
  } else {
    // More transferable than gaps = lateral move
    return 'lateral';
  }
}
