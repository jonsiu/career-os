import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexDatabaseProvider } from '@/lib/abstractions/providers/convex-database';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { resumeId, targetRole, targetIndustry } = body;

    if (!resumeId || !targetRole) {
      return NextResponse.json(
        { error: 'Resume ID and target role are required' },
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

    // Parse resume content
    let resumeData;
    try {
      resumeData = JSON.parse(resume.content);
    } catch {
      resumeData = { content: resume.content };
    }

    // Extract current role from resume
    const currentRole = resumeData.experience?.[0]?.title || 'Current Professional';
    const currentIndustry = resumeData.experience?.[0]?.company || 'Current Industry';

    // Use AI to identify transition type
    const prompt = `Analyze the following career transition and identify the transition type(s):

Current Role: ${currentRole}
Current Industry: ${currentIndustry}
Target Role: ${targetRole}
Target Industry: ${targetIndustry || 'Same as current'}

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
      model: 'claude-3-5-sonnet-20241022',
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
