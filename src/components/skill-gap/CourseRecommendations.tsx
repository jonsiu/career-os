'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Info, ExternalLink, Star, Clock, Award, Filter } from 'lucide-react';
import { CourseRecommendation, Course } from '@/lib/services/affiliate-recommendations';

interface CourseRecommendationsProps {
  recommendations: CourseRecommendation[];
  analysisId: string;
  userId: string;
}

type SortOption = 'rating' | 'price-low' | 'price-high' | 'duration-short' | 'duration-long';
type FilterOption = {
  providers: string[];
  priceTypes: string[];
  durations: string[];
};

export function CourseRecommendations({
  recommendations,
  analysisId,
  userId,
}: CourseRecommendationsProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [filters, setFilters] = useState<FilterOption>({
    providers: [],
    priceTypes: [],
    durations: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  // Track affiliate click
  const handleCourseClick = async (course: Course, skillName: string) => {
    try {
      // Track click via API
      await fetch('/api/recommendations/track-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId,
          skillName,
          courseProvider: course.provider,
          courseUrl: course.url,
          courseTitle: course.title,
        }),
      });

      // Open affiliate link in new tab
      window.open(course.affiliateUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
      // Still open link even if tracking fails
      window.open(course.affiliateUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Get provider color for badge
  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'coursera':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'udemy':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'linkedin learning':
      case 'linkedin':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get level color for badge
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter and sort courses
  const filteredAndSortedRecommendations = useMemo(() => {
    return recommendations.map(recommendation => {
      let filteredCourses = [...recommendation.courses];

      // Apply filters
      if (filters.providers.length > 0) {
        filteredCourses = filteredCourses.filter(course =>
          filters.providers.includes(course.provider)
        );
      }

      if (filters.priceTypes.length > 0) {
        filteredCourses = filteredCourses.filter(course => {
          const isFree = course.price === 'Free';
          return filters.priceTypes.includes(isFree ? 'Free' : 'Paid');
        });
      }

      if (filters.durations.length > 0) {
        filteredCourses = filteredCourses.filter(course => {
          const hours = course.estimatedHours;
          if (filters.durations.includes('short') && hours < 10) return true;
          if (filters.durations.includes('medium') && hours >= 10 && hours <= 40) return true;
          if (filters.durations.includes('long') && hours > 40) return true;
          return false;
        });
      }

      // Apply sorting
      const sortedCourses = [...filteredCourses].sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return b.rating - a.rating;
          case 'price-low':
            return parseCoursePrice(a.price) - parseCoursePrice(b.price);
          case 'price-high':
            return parseCoursePrice(b.price) - parseCoursePrice(a.price);
          case 'duration-short':
            return a.estimatedHours - b.estimatedHours;
          case 'duration-long':
            return b.estimatedHours - a.estimatedHours;
          default:
            return 0;
        }
      });

      return {
        ...recommendation,
        courses: sortedCourses,
      };
    });
  }, [recommendations, filters, sortBy]);

  // Parse price string to number for sorting
  const parseCoursePrice = (price: string): number => {
    if (price === 'Free') return 0;
    const numericPrice = price.replace(/[^0-9.]/g, '');
    return parseFloat(numericPrice) || 0;
  };

  // Toggle filter option
  const toggleFilter = (category: keyof FilterOption, value: string) => {
    setFilters(prev => {
      const currentValues = prev[category];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [category]: newValues,
      };
    });

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('courseFilters', JSON.stringify({
        ...filters,
        [category]: filters[category].includes(value)
          ? filters[category].filter(v => v !== value)
          : [...filters[category], value],
      }));
    }
  };

  // Load filters from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFilters = localStorage.getItem('courseFilters');
      if (savedFilters) {
        try {
          setFilters(JSON.parse(savedFilters));
        } catch (error) {
          console.error('Error parsing saved filters:', error);
        }
      }

      const savedSort = localStorage.getItem('courseSort') as SortOption;
      if (savedSort) {
        setSortBy(savedSort);
      }
    }
  }, []);

  // Save sort preference
  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    if (typeof window !== 'undefined') {
      localStorage.setItem('courseSort', newSort);
    }
  };

  return (
    <div className="space-y-6">
      {/* Affiliate Disclosure */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-900">
            <strong>Affiliate Disclosure:</strong> We may earn a commission from course purchases
            made through our links, at no additional cost to you. We only recommend courses that
            align with your skill development goals.
          </p>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {(filters.providers.length > 0 ||
            filters.priceTypes.length > 0 ||
            filters.durations.length > 0) && (
            <Badge variant="secondary" className="ml-2">
              {filters.providers.length + filters.priceTypes.length + filters.durations.length}
            </Badge>
          )}
        </Button>

        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm font-medium">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={e => handleSortChange(e.target.value as SortOption)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="duration-short">Shortest First</option>
            <option value="duration-long">Longest First</option>
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Provider Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Provider</label>
              <div className="flex flex-wrap gap-2">
                {['Coursera', 'Udemy', 'LinkedIn Learning'].map(provider => (
                  <Button
                    key={provider}
                    variant={filters.providers.includes(provider) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleFilter('providers', provider)}
                  >
                    {provider}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Price</label>
              <div className="flex flex-wrap gap-2">
                {['Free', 'Paid'].map(priceType => (
                  <Button
                    key={priceType}
                    variant={filters.priceTypes.includes(priceType) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleFilter('priceTypes', priceType)}
                  >
                    {priceType}
                  </Button>
                ))}
              </div>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Duration</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filters.durations.includes('short') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleFilter('durations', 'short')}
                >
                  Short (&lt;10hrs)
                </Button>
                <Button
                  variant={filters.durations.includes('medium') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleFilter('durations', 'medium')}
                >
                  Medium (10-40hrs)
                </Button>
                <Button
                  variant={filters.durations.includes('long') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleFilter('durations', 'long')}
                >
                  Long (&gt;40hrs)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Recommendations by Skill */}
      {filteredAndSortedRecommendations.map(recommendation => (
        <div key={recommendation.skillName} className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-900">
            Courses for {recommendation.skillName}
          </h3>

          {recommendation.courses.length === 0 ? (
            <p className="text-sm text-gray-500">
              No courses match your current filters. Try adjusting your filter settings.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendation.courses.map((course, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-5 space-y-3">
                    {/* Provider and Quick Win Badges */}
                    <div className="flex items-center justify-between">
                      <Badge className={getProviderColor(course.provider)}>{course.provider}</Badge>
                      {course.isQuickWin && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Quick Win
                        </Badge>
                      )}
                    </div>

                    {/* Course Title */}
                    <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">
                      {course.title}
                    </h3>

                    {/* Rating and Reviews */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        ({course.reviewCount.toLocaleString()} reviews)
                      </span>
                    </div>

                    {/* Course Details */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.estimatedHours} hours</span>
                      </div>
                      <Badge variant="outline" className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-lg font-bold text-gray-900">
                        {course.price === 'Free' ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          course.price
                        )}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCourse(course)}
                        >
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleCourseClick(course, recommendation.skillName)}
                          className="flex items-center gap-1"
                        >
                          View Course
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Course Preview Modal */}
      <Dialog open={selectedCourse !== null} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCourse?.title}</DialogTitle>
            <DialogDescription>
              <Badge className={getProviderColor(selectedCourse?.provider || '')}>
                {selectedCourse?.provider}
              </Badge>
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-4">
              {/* Course Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Rating</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{selectedCourse.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">
                      ({selectedCourse.reviewCount.toLocaleString()} reviews)
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{selectedCourse.estimatedHours} hours</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Level</div>
                  <div className="mt-1">
                    <Badge variant="outline" className={getLevelColor(selectedCourse.level)}>
                      {selectedCourse.level}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Price</div>
                  <div className="text-lg font-bold mt-1">
                    {selectedCourse.price === 'Free' ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      selectedCourse.price
                    )}
                  </div>
                </div>
              </div>

              {/* Topics */}
              {selectedCourse.topics.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Topics Covered</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.topics.map((topic, idx) => (
                      <Badge key={idx} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4 border-t">
                <Button
                  className="w-full"
                  onClick={() => {
                    if (selectedCourse) {
                      handleCourseClick(
                        selectedCourse,
                        recommendations.find(r =>
                          r.courses.some(c => c.title === selectedCourse.title)
                        )?.skillName || ''
                      );
                      setSelectedCourse(null);
                    }
                  }}
                >
                  Enroll Now
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
