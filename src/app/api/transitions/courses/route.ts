import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { searchCourses } from '@/lib/integrations/course-providers';

const AFFILIATE_DISCLOSURE =
  'We may earn a commission from course purchases made through these affiliate links.';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { skillName, criticalityLevel, targetRole } = body;

    if (!skillName) {
      return NextResponse.json(
        { error: 'Skill name is required' },
        { status: 400 }
      );
    }

    // Search for courses across multiple providers
    let courses = [];
    let providersUsed = [];

    try {
      const searchResults = await searchCourses(skillName, {
        targetRole,
        criticalityLevel,
        limit: 4, // Get top 4 courses per skill
      });

      courses = searchResults.courses;
      providersUsed = searchResults.providers;
    } catch (error) {
      console.error('Course search error (returning empty results):', error);
      // Gracefully handle course API failures
      courses = [];
      providersUsed = [];
    }

    // If no courses found, provide fallback message
    if (courses.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          courses: [],
          message: `No courses found for "${skillName}". Try searching directly on Coursera, Udemy, or LinkedIn Learning.`,
        },
        affiliateDisclosure: AFFILIATE_DISCLOSURE,
        providersUsed: [],
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        courses,
        skillName,
        criticalityLevel,
      },
      affiliateDisclosure: AFFILIATE_DISCLOSURE,
      providersUsed,
    });

  } catch (error) {
    console.error('Courses API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
