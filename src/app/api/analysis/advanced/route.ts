import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexDatabaseProvider } from '@/lib/abstractions/providers/convex-database';
import { ServerAnalysisProvider } from '@/lib/abstractions/providers/server-analysis';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    // Get resume data
    const databaseProvider = new ConvexDatabaseProvider();
    const resume = await databaseProvider.getResumeById(resumeId);
    
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Perform advanced analysis (research-based)
    const analysisProvider = new ServerAnalysisProvider();
    const analysisResult = await analysisProvider.performAdvancedResumeAnalysis(resume);

    return NextResponse.json({
      success: true,
      data: analysisResult,
      type: 'advanced'
    });

  } catch (error) {
    console.error('Advanced analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
