/**
 * O*NET Occupation Search API
 * Task Group 3.2.2: Search occupations by query string
 *
 * GET /api/onet/search?query={query}
 * Returns: List of matching O*NET occupations
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ONetProviderImpl } from '@/lib/abstractions/providers/onet-provider';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract and validate query parameter
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Initialize O*NET provider
    const onetProvider = new ONetProviderImpl();

    // Search occupations
    const occupations = await onetProvider.searchOccupations(query.trim());

    // Implement pagination (limit to 20 results as per spec)
    const limit = 20;
    const paginatedOccupations = occupations.slice(0, limit);

    return NextResponse.json({
      success: true,
      occupations: paginatedOccupations,
      count: paginatedOccupations.length,
      total: occupations.length,
    });

  } catch (error) {
    console.error('O*NET search API error:', error);

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
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
