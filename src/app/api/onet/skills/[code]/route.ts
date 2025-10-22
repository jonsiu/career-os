/**
 * O*NET Occupation Skills API
 * Task Group 3.2.4: Get occupation skill requirements only (optimized subset)
 *
 * GET /api/onet/skills/[code]
 * Returns: Only skills array for the occupation (subset of full occupation details)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ONetProviderImpl } from '@/lib/abstractions/providers/onet-provider';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get occupation code from route parameter
    const { code } = params;

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Occupation code is required' },
        { status: 400 }
      );
    }

    // Initialize O*NET provider
    const onetProvider = new ONetProviderImpl();

    // Get occupation data (will use cache if available)
    let occupation = await onetProvider.getCachedOccupation(code);
    let cached = !!occupation;

    if (!occupation) {
      // Cache miss - fetch from O*NET API
      try {
        occupation = await onetProvider.getOccupationSkills(code);

        // Cache the result for future requests
        await onetProvider.cacheOccupation(code, occupation);
      } catch (fetchError) {
        // Check if it's a "not found" error
        if (fetchError instanceof Error && fetchError.message.includes('not found')) {
          return NextResponse.json(
            { error: 'Occupation not found' },
            { status: 404 }
          );
        }
        throw fetchError; // Re-throw for generic error handling
      }
    }

    // Return only skills array (optimized for skill gap analysis consumption)
    return NextResponse.json({
      success: true,
      skills: occupation.skills,
      occupationCode: code,
      occupationTitle: occupation.occupationTitle,
      cached,
    });

  } catch (error) {
    console.error('O*NET skills API error:', error);

    // Determine appropriate error response
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Request timeout. Please try again.' },
          { status: 504 }
        );
      }

      if (error.message.includes('unavailable')) {
        return NextResponse.json(
          { error: 'O*NET service temporarily unavailable.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
