import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexDatabaseProvider } from '@/lib/abstractions/providers/convex-database';
import { validateSkill, getSkillRequirements } from '@/lib/integrations/onet-api';
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
    const { resumeId, currentRole, targetRole } = body;

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

    // Parse resume content
    let resumeData;
    try {
      resumeData = JSON.parse(resume.content);
    } catch {
      resumeData = { content: resume.content };
    }

    // Extract current skills from resume
    const currentSkills = resumeData.skills?.map((s: any) => s.name) || [];

    // Use AI to identify required skills for target role
    const prompt = `Analyze the skill gap for this career transition:

Current Role: ${currentRole}
Current Skills: ${currentSkills.join(', ')}
Target Role: ${targetRole}

Resume Summary:
${JSON.stringify(resumeData, null, 2)}

Identify:
1. Required skills for the target role
2. Skills the person already has that transfer
3. Critical vs. nice-to-have skills
4. Estimated learning time for each missing skill

Respond with a JSON object containing:
{
  "skillGaps": [
    {
      "skill": "skill name",
      "criticality": "critical" | "important" | "nice-to-have",
      "transferable": true | false,
      "transferableFrom": ["current skill 1", ...] (if transferable),
      "learningTime": {
        "minWeeks": number,
        "maxWeeks": number
      },
      "complexity": "basic" | "intermediate" | "advanced"
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
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
    let skillsGapData;

    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        skillsGapData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      // Fallback skill gaps
      skillsGapData = {
        skillGaps: [
          {
            skill: 'Leadership',
            criticality: 'critical',
            transferable: false,
            learningTime: { minWeeks: 12, maxWeeks: 24 },
            complexity: 'advanced',
          },
        ],
      };
    }

    // Validate skills with O*NET API (with graceful degradation)
    let onetValidation = false;
    try {
      for (const skillGap of skillsGapData.skillGaps) {
        const validation = await validateSkill(skillGap.skill);
        if (validation) {
          skillGap.onetCode = validation.code;
          skillGap.onetValidated = true;
          onetValidation = true;
        }
      }
    } catch (error) {
      console.error('O*NET API error (gracefully degrading to AI-only analysis):', error);
      // Continue without O*NET validation
      onetValidation = false;
    }

    return NextResponse.json({
      success: true,
      data: skillsGapData,
      onetValidation,
    });

  } catch (error) {
    console.error('Skills gap analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
