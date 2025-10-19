import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// In-memory cache for benchmarking data (will be moved to database later)
const benchmarkCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const transitionType = searchParams.get('transitionType');
    const currentRole = searchParams.get('currentRole');
    const targetRole = searchParams.get('targetRole');

    if (!transitionType || !currentRole || !targetRole) {
      return NextResponse.json(
        { error: 'Transition type, current role, and target role are required' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `${transitionType}:${currentRole}:${targetRole}`;
    const cachedData = benchmarkCache.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cachedData.data,
        cached: true,
      });
    }

    // Generate AI-based benchmarking data
    // In the future, this will be replaced with real user data
    const prompt = `Provide realistic benchmarking data for this career transition:

Transition Type: ${transitionType}
Current Role: ${currentRole}
Target Role: ${targetRole}

Based on industry research and typical career transitions, provide:
1. Similar transitions (how to describe this category of transitions)
2. Average timeline (realistic range in months)
3. Success rate (percentage, be realistic - not all transitions succeed)
4. Key success factors
5. Common challenges

Respond with a JSON object containing:
{
  "similarTransitions": "description of similar transition paths",
  "averageTimeline": "X-Y months",
  "successRate": number (0-100),
  "keyFactors": ["factor 1", "factor 2", ...],
  "challenges": ["challenge 1", "challenge 2", ...],
  "sampleSize": number (estimated number of similar transitions),
  "confidence": "low" | "medium" | "high"
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
    let benchmarkData;

    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        benchmarkData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      // Fallback benchmarking data
      benchmarkData = {
        similarTransitions: `${currentRole} to ${targetRole} transitions`,
        averageTimeline: '8-12 months',
        successRate: 65,
        keyFactors: ['Relevant skills development', 'Networking', 'Industry knowledge'],
        challenges: ['Skill gaps', 'Limited relevant experience', 'Competition'],
        sampleSize: 100,
        confidence: 'medium',
      };
    }

    // Cache the result
    benchmarkCache.set(cacheKey, {
      data: benchmarkData,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      data: benchmarkData,
      cached: false,
    });

  } catch (error) {
    console.error('Benchmarks API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
