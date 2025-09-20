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
    const analysisType = searchParams.get('analysisType') as 'basic' | 'advanced' | undefined;

    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    const analysisProvider = new ServerAnalysisProvider();
    
    // Get analysis history
    const history = await analysisProvider.getAnalysisHistory(resumeId, analysisType);

    return NextResponse.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Analysis history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
