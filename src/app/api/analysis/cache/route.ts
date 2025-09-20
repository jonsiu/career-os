import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ServerAnalysisProvider } from '@/lib/abstractions/providers/server-analysis';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('resumeId');
    const analysisType = searchParams.get('analysisType') as 'basic' | 'advanced' | 'ai-powered';

    if (!resumeId || !analysisType) {
      return NextResponse.json(
        { error: 'Resume ID and analysis type are required' },
        { status: 400 }
      );
    }

    const analysisProvider = new ServerAnalysisProvider();
    
    // Get cached analysis result
    const cachedResult = await analysisProvider.getCachedAnalysisResult(resumeId, analysisType);

    return NextResponse.json({
      success: true,
      data: cachedResult,
      cached: !!cachedResult
    });

  } catch (error) {
    console.error('Cache API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { resumeId, analysisType, contentHash } = body;

    if (!resumeId || !analysisType || !contentHash) {
      return NextResponse.json(
        { error: 'Resume ID, analysis type, and content hash are required' },
        { status: 400 }
      );
    }

    const analysisProvider = new ServerAnalysisProvider();
    
    // Check if analysis exists in cache
    const cacheCheck = await analysisProvider.checkAnalysisCache(resumeId, analysisType, contentHash);

    return NextResponse.json({
      success: true,
      data: cacheCheck
    });

  } catch (error) {
    console.error('Cache check API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
