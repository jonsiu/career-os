/**
 * O*NET Occupation Details API
 * Task Group 3.2.3: Get full occupation details by O*NET SOC code
 *
 * GET /api/onet/occupation/[code]
 * Returns: Complete occupation data including skills, knowledge, abilities, and labor market data
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

    // Check cache first (provider handles this internally, but explicit for clarity)
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

    return NextResponse.json({
      success: true,
      occupation,
      cached,
    });

  } catch (error) {
    console.error('O*NET occupation API error:', error);

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
          { error: 'O*NET service temporarily unavailable. Using cached data if available.' },
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
