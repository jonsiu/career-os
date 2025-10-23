import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexDatabaseProvider } from '@/lib/abstractions/providers/convex-database';
import { generateContentHash } from '@/lib/utils/content-hash';
import Anthropic from '@anthropic-ai/sdk';
import { DEFAULT_CLAUDE_MODEL } from '@/lib/constants/ai-models';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize Anthropic client
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const body = await request.json();
    const {
      resumeId,
      transitionTypes,
      currentRole,
      targetRole,
      currentIndustry,
      targetIndustry,
    } = body;

    if (!resumeId || !currentRole || !targetRole) {
      return NextResponse.json(
        { error: 'Resume ID, current role, and target role are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const databaseProvider = new ConvexDatabaseProvider();
    const user = await databaseProvider.getUserByClerkId(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get resume data
    const resume = await databaseProvider.getResumeById(resumeId);

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Verify resume ownership
    if (resume.userId !== user._id) {
      return NextResponse.json({ error: 'Not authorized to access this resume' }, { status: 403 });
    }

    // Generate content hash for caching
    const cacheKey = JSON.stringify({
      resumeId,
      currentRole,
      targetRole,
      currentIndustry,
      targetIndustry,
      transitionTypes,
    });
    const contentHash = await generateContentHash({ content: cacheKey, id: resumeId });

    // Check cache (placeholder - will be implemented with Convex table)
    // For now, we'll skip caching and always generate fresh roadmap
    const cached = false;

    if (cached) {
      // Return cached result
      // This will be implemented once the database schema is ready
    }

    // Parse resume content
    let resumeData;
    try {
      resumeData = JSON.parse(resume.content);
    } catch {
      resumeData = { content: resume.content };
    }

    // Generate AI-powered roadmap
    const prompt = `Generate a personalized career transition roadmap:

Current Role: ${currentRole}
Target Role: ${targetRole}
Current Industry: ${currentIndustry || 'Not specified'}
Target Industry: ${targetIndustry || 'Same as current'}
Transition Types: ${transitionTypes?.join(', ') || 'cross-role'}

Resume Summary:
${JSON.stringify(resumeData, null, 2)}

Create a detailed transition roadmap with:
1. Realistic timeline (6-18 months typical range) based on skill complexity and transition difficulty
2. Key milestones with target dates and effort estimates
3. Bridge roles for difficult transitions (intermediate positions to aim for)
4. Factors affecting timeline (learning velocity, skill gaps, experience level)

Respond with a JSON object containing:
{
  "timeline": {
    "minMonths": number,
    "maxMonths": number,
    "factors": ["factor 1", "factor 2", ...]
  },
  "milestones": [
    {
      "title": "milestone title",
      "description": "what to accomplish",
      "targetMonth": number (from start),
      "effortWeeks": number,
      "status": "pending"
    }
  ],
  "bridgeRoles": ["role 1", "role 2"] (if applicable),
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

    const message = await anthropic.messages.create({
      model: DEFAULT_CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parse AI response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    let roadmapData;

    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        roadmapData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      // Fallback roadmap
      roadmapData = {
        timeline: {
          minMonths: 6,
          maxMonths: 12,
          factors: ['Skill development time', 'Industry transition complexity'],
        },
        milestones: [
          {
            title: 'Assess Current Skills',
            description: 'Complete skills gap analysis',
            targetMonth: 1,
            effortWeeks: 2,
            status: 'pending',
          },
          {
            title: 'Begin Skill Development',
            description: 'Start learning critical missing skills',
            targetMonth: 2,
            effortWeeks: 12,
            status: 'pending',
          },
          {
            title: 'Achieve Target Role',
            description: 'Secure position in target role',
            targetMonth: 12,
            effortWeeks: 4,
            status: 'pending',
          },
        ],
        bridgeRoles: [],
        recommendations: ['Focus on critical skills first', 'Build relevant project portfolio'],
      };
    }

    // Save to cache (placeholder - will be implemented with Convex)
    // await saveRoadmapCache(resumeId, contentHash, roadmapData);

    return NextResponse.json({
      success: true,
      data: roadmapData,
      cached: false,
      contentHash,
    });

  } catch (error) {
    console.error('Roadmap generation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
