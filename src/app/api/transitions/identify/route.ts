import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexDatabaseProvider } from '@/lib/abstractions/providers/convex-database';
import Anthropic from '@anthropic-ai/sdk';
import { DEFAULT_CLAUDE_MODEL } from '@/lib/constants/ai-models';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize Anthropic client with API key
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
    const { resumeId, currentRole, currentIndustry, targetRole, targetIndustry, changingIndustry, changingFunction } = body;

    if (!targetRole) {
      return NextResponse.json(
        { error: 'Target role is required' },
        { status: 400 }
      );
    }

    // Get user from database
    const databaseProvider = new ConvexDatabaseProvider();
    const user = await databaseProvider.getUserByClerkId(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize resume data
    let resumeData: any = {};
    let actualCurrentRole = currentRole || 'Current Professional';
    let actualCurrentIndustry = currentIndustry || 'Current Industry';

    // If resumeId is provided, fetch resume data
    if (resumeId) {
      const resume = await databaseProvider.getResumeById(resumeId);

      if (resume && resume.userId === user._id) {
        // Parse resume content
        try {
          resumeData = JSON.parse(resume.content);
        } catch {
          resumeData = { content: resume.content };
        }

        // Extract current role from resume if not provided
        if (!currentRole) {
          actualCurrentRole = resumeData.experience?.[0]?.title || 'Current Professional';
        }
        if (!currentIndustry) {
          actualCurrentIndustry = resumeData.experience?.[0]?.company || 'Current Industry';
        }
      }
    }

    // Use AI to identify transition type
    const prompt = `Analyze the following career transition and identify the transition type(s):

Current Role: ${actualCurrentRole}
Current Industry: ${actualCurrentIndustry}
Target Role: ${targetRole}
Target Industry: ${targetIndustry || 'Same as current'}
Changing Industry: ${changingIndustry ? 'Yes' : 'No'}
Changing Function: ${changingFunction ? 'Yes' : 'No'}

Resume Summary:
${JSON.stringify(resumeData, null, 2)}

Identify if this is a:
1. Cross-Role transition (changing job function, e.g., IC to Manager)
2. Cross-Industry transition (changing industry sector)
3. Cross-Function transition (changing department/function, e.g., Engineering to Product)
4. Hybrid transition (multiple types simultaneously)

Respond with a JSON object containing:
{
  "transitionTypes": ["cross-role" | "cross-industry" | "cross-function"],
  "primaryTransitionType": "cross-role" | "cross-industry" | "cross-function",
  "currentRole": "extracted current role title",
  "targetRole": "the target role",
  "analysis": "brief explanation of the transition challenge",
  "difficulty": "low" | "medium" | "high"
}`;

    const message = await anthropic.messages.create({
      model: DEFAULT_CLAUDE_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parse AI response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    let transitionData;

    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        transitionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      // Fallback to basic detection
      transitionData = {
        transitionTypes: ['cross-role'],
        primaryTransitionType: 'cross-role',
        currentRole,
        targetRole,
        analysis: 'Unable to perform detailed analysis. Default classification applied.',
        difficulty: 'medium',
      };
    }

    return NextResponse.json({
      success: true,
      data: transitionData,
    });

  } catch (error) {
    console.error('Transition identification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
