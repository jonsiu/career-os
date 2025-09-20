import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ServerAnalysisProvider } from '@/lib/abstractions/providers/server-analysis';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { resumeId, analysisType, analysisResult, contentHash } = body;

    if (!resumeId || !analysisType || !analysisResult || !contentHash) {
      return NextResponse.json(
        { error: 'Resume ID, analysis type, analysis result, and content hash are required' },
        { status: 400 }
      );
    }

    const analysisProvider = new ServerAnalysisProvider();
    
    // Save analysis result
    await analysisProvider.saveAnalysisResult(resumeId, analysisType, analysisResult, contentHash);

    return NextResponse.json({
      success: true,
      message: 'Analysis result saved successfully'
    });

  } catch (error) {
    console.error('Save analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
