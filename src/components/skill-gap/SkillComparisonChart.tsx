"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

export interface SkillComparison {
  skillName: string;
  currentLevel: number; // 0-100
  targetLevel: number; // 0-100
  gap: number; // calculated
  category?: string;
  gapType?: 'critical' | 'nice-to-have' | 'transferable';
}

export interface SkillComparisonChartProps {
  skills: SkillComparison[];
  showLegend?: boolean;
  maxSkillsDisplay?: number;
  className?: string;
}

const GAP_TYPE_COLORS = {
  critical: '#ef4444',
  'nice-to-have': '#f59e0b',
  transferable: '#10b981',
  default: '#3b82f6',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold">{entry.value}%</span>
          </div>
        ))}
        {payload[0]?.payload?.gap !== undefined && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <span className="text-xs text-muted-foreground">Gap: </span>
            <span className="text-xs font-semibold text-red-600">
              {payload[0].payload.gap}%
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function SkillComparisonChart({
  skills,
  showLegend = true,
  maxSkillsDisplay = 10,
  className
}: SkillComparisonChartProps) {
  // Sort skills by gap (descending) and limit display
  const displaySkills = [...skills]
    .sort((a, b) => b.gap - a.gap)
    .slice(0, maxSkillsDisplay)
    .map(skill => ({
      ...skill,
      gap: skill.gap || (skill.targetLevel - skill.currentLevel),
    }));

  if (skills.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Skill Comparison</CardTitle>
          <CardDescription>No skills to compare</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No skill data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Skill Level Comparison
              <Info className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            <CardDescription>
              Current vs. target skill levels (showing top {Math.min(maxSkillsDisplay, skills.length)} by gap)
            </CardDescription>
          </div>
          {skills.length > maxSkillsDisplay && (
            <Badge variant="outline" className="text-xs">
              +{skills.length - maxSkillsDisplay} more
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop/Tablet: Bar Chart */}
        <div className="hidden sm:block">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={displaySkills}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="skillName"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                label={{ value: 'Proficiency (%)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
              {showLegend && (
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="square"
                />
              )}
              <Bar
                dataKey="currentLevel"
                name="Current Level"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="targetLevel"
                name="Target Level"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mobile: List View with Mini Charts */}
        <div className="sm:hidden space-y-4">
          {displaySkills.map((skill, index) => {
            const gapColor = GAP_TYPE_COLORS[skill.gapType || 'default'];

            return (
              <div
                key={`${skill.skillName}-${index}`}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-sm">{skill.skillName}</h4>
                  {skill.gapType && (
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: gapColor }}
                    >
                      {skill.gapType === 'critical' ? 'Critical' :
                       skill.gapType === 'nice-to-have' ? 'Nice-to-Have' :
                       'Transferable'}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  {/* Current Level */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Current</span>
                      <span className="font-semibold text-blue-600">{skill.currentLevel}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${skill.currentLevel}%` }}
                        role="progressbar"
                        aria-valuenow={skill.currentLevel}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${skill.skillName} current level`}
                      />
                    </div>
                  </div>

                  {/* Target Level */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Target</span>
                      <span className="font-semibold text-green-600">{skill.targetLevel}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${skill.targetLevel}%` }}
                        role="progressbar"
                        aria-valuenow={skill.targetLevel}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${skill.skillName} target level`}
                      />
                    </div>
                  </div>

                  {/* Gap */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Gap to close</span>
                      <span
                        className="font-semibold"
                        style={{ color: gapColor }}
                      >
                        {skill.gap}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Statistics */}
        <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{skills.length}</div>
            <div className="text-xs text-muted-foreground">Total Skills</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {Math.round(
                skills.reduce((sum, s) => sum + s.currentLevel, 0) / skills.length
              )}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Current</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {Math.round(
                skills.reduce((sum, s) => sum + s.targetLevel, 0) / skills.length
              )}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Target</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {Math.round(
                skills.reduce((sum, s) => sum + (s.gap || s.targetLevel - s.currentLevel), 0) /
                  skills.length
              )}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Gap</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
