import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Clock, Award } from "lucide-react";

interface BenchmarkData {
  similarTransitions: string;
  averageTimeline: string;
  successRate?: number;
}

interface UserTimeline {
  minMonths: number;
  maxMonths: number;
}

interface BenchmarkingDisplayProps {
  benchmarkData: BenchmarkData;
  userTimeline: UserTimeline;
}

export function BenchmarkingDisplay({
  benchmarkData,
  userTimeline,
}: BenchmarkingDisplayProps) {
  // Parse average timeline to get numeric value for comparison
  const parseTimelineMonths = (timeline: string): number => {
    const match = timeline.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };

  const avgMonths = parseTimelineMonths(benchmarkData.averageTimeline);
  const userAvgMonths = (userTimeline.minMonths + userTimeline.maxMonths) / 2;

  const getTimelineComparison = () => {
    if (userAvgMonths < avgMonths) {
      return {
        text: 'Faster than average',
        color: 'text-green-600',
        icon: '🚀',
      };
    } else if (userAvgMonths > avgMonths) {
      return {
        text: 'More conservative timeline',
        color: 'text-blue-600',
        icon: '🎯',
      };
    } else {
      return {
        text: 'On par with average',
        color: 'text-purple-600',
        icon: '✓',
      };
    }
  };

  const comparison = getTimelineComparison();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          Benchmarking Data
        </h2>
        <p className="mt-2 text-gray-600">
          See how your timeline compares to similar career transitions
        </p>
      </div>

      {/* Overview Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Similar Transitions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Transition Type</p>
            <p className="text-2xl font-bold text-blue-600">
              {benchmarkData.similarTransitions}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <Clock className="mx-auto h-6 w-6 text-purple-600 mb-2" />
              <p className="text-sm text-gray-600 mb-1">Average Timeline</p>
              <p className="text-xl font-bold text-purple-600">
                {benchmarkData.averageTimeline}
              </p>
            </div>

            {benchmarkData.successRate !== undefined && (
              <div className="bg-white rounded-lg p-4 text-center">
                <Award className="mx-auto h-6 w-6 text-green-600 mb-2" />
                <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                <p className="text-xl font-bold text-green-600">
                  {benchmarkData.successRate}%
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Your Timeline vs. Average
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visual Comparison */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Average Timeline</span>
                <span className="text-sm font-bold text-purple-600">
                  {benchmarkData.averageTimeline}
                </span>
              </div>
              <Progress value={100} className="h-3 bg-purple-100" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Your Timeline</span>
                <span className="text-sm font-bold text-blue-600">
                  {userTimeline.minMonths}-{userTimeline.maxMonths} months
                </span>
              </div>
              <Progress
                value={(userAvgMonths / avgMonths) * 100}
                className="h-3 bg-blue-100"
              />
            </div>
          </div>

          {/* Comparison Badge */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{comparison.icon}</span>
              <div>
                <p className={`font-semibold ${comparison.color}`}>
                  {comparison.text}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {userAvgMonths < avgMonths && (
                    <>
                      You're targeting a {Math.round(((avgMonths - userAvgMonths) / avgMonths) * 100)}%
                      faster timeline. This is achievable with dedicated effort and strong
                      transferable skills.
                    </>
                  )}
                  {userAvgMonths > avgMonths && (
                    <>
                      You've given yourself {Math.round(userAvgMonths - avgMonths)} extra months.
                      This provides buffer time for deeper learning and reduces stress.
                    </>
                  )}
                  {userAvgMonths === avgMonths && (
                    <>
                      Your timeline aligns with typical transitions of this type.
                      This is a realistic and achievable goal.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline Range Visualization */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Timeline Range</p>
            <div className="relative h-16 bg-gray-100 rounded-lg overflow-hidden">
              {/* Min to Max Range Bar */}
              <div
                className="absolute top-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-30"
                style={{
                  left: `${(userTimeline.minMonths / 24) * 100}%`,
                  width: `${((userTimeline.maxMonths - userTimeline.minMonths) / 24) * 100}%`,
                }}
              />

              {/* Average Marker */}
              <div
                className="absolute top-0 h-full w-1 bg-purple-600"
                style={{
                  left: `${(avgMonths / 24) * 100}%`,
                }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <Badge className="bg-purple-600 text-white text-xs">
                    Avg: {avgMonths}mo
                  </Badge>
                </div>
              </div>

              {/* Month Labels */}
              <div className="absolute bottom-1 left-0 right-0 flex justify-between px-2 text-xs text-gray-600">
                <span>0mo</span>
                <span>6mo</span>
                <span>12mo</span>
                <span>18mo</span>
                <span>24mo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Factors */}
      {benchmarkData.successRate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Success Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">✓</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {benchmarkData.successRate}% Success Rate
                  </p>
                  <p className="text-sm text-gray-600">
                    This is the percentage of professionals who successfully completed this
                    type of transition within the average timeline.
                  </p>
                </div>
              </div>

              {benchmarkData.successRate >= 70 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-900">
                    <strong>High success rate!</strong> This transition type has a strong track
                    record. With proper preparation and dedication, you have excellent chances
                    of success.
                  </p>
                </div>
              )}

              {benchmarkData.successRate < 70 && benchmarkData.successRate >= 50 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-900">
                    <strong>Moderate success rate.</strong> This transition requires focused
                    effort and skill development. Following the recommended roadmap will
                    significantly improve your chances.
                  </p>
                </div>
              )}

              {benchmarkData.successRate < 50 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-900">
                    <strong>Challenging transition.</strong> This type of transition is ambitious.
                    Consider the bridge roles recommended and give yourself adequate time to
                    develop the necessary skills.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
