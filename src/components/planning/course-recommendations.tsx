import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Info } from "lucide-react";

interface Course {
  provider: string;
  title: string;
  url: string;
  affiliateLink: string;
  price?: number;
}

interface CourseRecommendationsProps {
  courses: Course[];
  skillName: string;
}

export function CourseRecommendations({ courses, skillName }: CourseRecommendationsProps) {
  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'coursera':
        return 'bg-blue-100 text-blue-800';
      case 'udemy':
        return 'bg-purple-100 text-purple-800';
      case 'linkedin learning':
      case 'linkedin':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCourseClick = (course: Course) => {
    // Track affiliate link click (analytics event)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'affiliate_click', {
        event_category: 'course',
        event_label: `${course.provider} - ${course.title}`,
        value: course.price,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Affiliate Disclosure */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-900">
          <strong>Affiliate Disclosure:</strong> These are affiliate links. We may earn a
          commission if you enroll in a course, at no additional cost to you. We only
          recommend courses we believe will help you develop this skill.
        </p>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {courses.map((course, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Provider Badge */}
                <div className="flex items-center justify-between">
                  <Badge className={getProviderColor(course.provider)}>
                    {course.provider}
                  </Badge>
                  {course.price !== undefined && (
                    <span className="text-lg font-bold text-gray-900">
                      ${course.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Course Title */}
                <h5 className="font-semibold text-gray-900 line-clamp-2">
                  {course.title}
                </h5>

                {/* Course Link */}
                <a
                  href={course.affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleCourseClick(course)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  View Course
                  <ExternalLink className="h-4 w-4" />
                </a>

                {/* Value Proposition */}
                <p className="text-xs text-gray-600">
                  Learn {skillName} from industry experts with hands-on projects
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <div className="text-xs text-gray-500 text-center mt-4">
        <p>
          Can't find what you're looking for?{' '}
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(skillName + ' online course')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Search for more courses
          </a>
        </p>
      </div>
    </div>
  );
}
