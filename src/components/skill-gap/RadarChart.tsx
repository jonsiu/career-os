"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SkillDimension {
  name: string;
  currentValue: number; // 0-100
  targetValue: number; // 0-100
}

export interface RadarChartProps {
  dimensions: SkillDimension[];
  className?: string;
}

const calculatePoints = (dimensions: SkillDimension[], radius: number, centerX: number, centerY: number, values: 'current' | 'target'): string => {
  const angleStep = (Math.PI * 2) / dimensions.length;

  return dimensions
    .map((dim, index) => {
      const value = values === 'current' ? dim.currentValue : dim.targetValue;
      const angle = angleStep * index - Math.PI / 2; // Start from top
      const distance = (value / 100) * radius;
      const x = centerX + distance * Math.cos(angle);
      const y = centerY + distance * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');
};

const calculateLabelPosition = (index: number, total: number, radius: number, centerX: number, centerY: number) => {
  const angleStep = (Math.PI * 2) / total;
  const angle = angleStep * index - Math.PI / 2;
  const labelRadius = radius + 30;
  const x = centerX + labelRadius * Math.cos(angle);
  const y = centerY + labelRadius * Math.sin(angle);
  return { x, y, angle };
};

export function RadarChart({ dimensions, className }: RadarChartProps) {
  const svgSize = 400;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const radius = 140;
  const levels = 5;

  if (dimensions.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Skill Profile Comparison</CardTitle>
          <CardDescription>
            No skill dimensions available for comparison
          </CardDescription>
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

  const currentPoints = calculatePoints(dimensions, radius, centerX, centerY, 'current');
  const targetPoints = calculatePoints(dimensions, radius, centerX, centerY, 'target');

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Skill Profile Comparison
          <Info className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
        <CardDescription>
          Current vs. target skill levels across key dimensions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center" role="list" aria-label="Chart legend">
          <div className="flex items-center gap-2" role="listitem">
            <div className="w-4 h-4 rounded-full bg-blue-500 opacity-60" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Current Level</span>
          </div>
          <div className="flex items-center gap-2" role="listitem">
            <div className="w-4 h-4 rounded-full bg-green-500 opacity-60" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Target Level</span>
          </div>
        </div>

        {/* Chart */}
        <div className="flex justify-center">
          <svg
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className="w-full max-w-md"
            role="img"
            aria-label="Radar chart showing current vs target skill levels"
          >
            {/* Background circles */}
            {Array.from({ length: levels }).map((_, i) => (
              <circle
                key={`level-${i}`}
                cx={centerX}
                cy={centerY}
                r={(radius / levels) * (i + 1)}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}

            {/* Axes */}
            {dimensions.map((_, index) => {
              const pos = calculateLabelPosition(index, dimensions.length, radius, centerX, centerY);
              return (
                <line
                  key={`axis-${index}`}
                  x1={centerX}
                  y1={centerY}
                  x2={pos.x - 30 * Math.cos(pos.angle)}
                  y2={pos.y - 30 * Math.sin(pos.angle)}
                  stroke="#d1d5db"
                  strokeWidth="1"
                />
              );
            })}

            {/* Target polygon (behind) */}
            <polygon
              points={targetPoints}
              fill="#10b981"
              fillOpacity="0.2"
              stroke="#10b981"
              strokeWidth="2"
              strokeOpacity="0.6"
            />

            {/* Current polygon (front) */}
            <polygon
              points={currentPoints}
              fill="#3b82f6"
              fillOpacity="0.3"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeOpacity="0.8"
            />

            {/* Labels */}
            {dimensions.map((dim, index) => {
              const pos = calculateLabelPosition(index, dimensions.length, radius, centerX, centerY);
              return (
                <text
                  key={`label-${index}`}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-medium fill-gray-700"
                  style={{ fontSize: '12px' }}
                >
                  {dim.name}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Data table for accessibility */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            View data table
          </summary>
          <table className="w-full mt-4 text-sm" role="table" aria-label="Skill dimensions data">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2" scope="col">Dimension</th>
                <th className="text-right p-2" scope="col">Current</th>
                <th className="text-right p-2" scope="col">Target</th>
                <th className="text-right p-2" scope="col">Gap</th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map((dim, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2 font-medium">{dim.name}</td>
                  <td className="p-2 text-right">
                    <Badge variant="outline" className="bg-blue-50 border-blue-300">
                      {dim.currentValue}%
                    </Badge>
                  </td>
                  <td className="p-2 text-right">
                    <Badge variant="outline" className="bg-green-50 border-green-300">
                      {dim.targetValue}%
                    </Badge>
                  </td>
                  <td className="p-2 text-right">
                    <Badge
                      variant="outline"
                      className={cn(
                        dim.targetValue - dim.currentValue > 30
                          ? "bg-red-50 border-red-300"
                          : "bg-yellow-50 border-yellow-300"
                      )}
                    >
                      {dim.targetValue - dim.currentValue}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </CardContent>
    </Card>
  );
}
