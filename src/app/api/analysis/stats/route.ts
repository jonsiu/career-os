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

    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    const analysisProvider = new ServerAnalysisProvider();
    
    // Get analysis statistics
    const stats = await analysisProvider.getAnalysisStats(resumeId);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Analysis stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
