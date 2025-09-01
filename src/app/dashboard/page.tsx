import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Briefcase, 
  BarChart3, 
  Target,
  TrendingUp,
  Calendar
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome to CareerOS</h1>
        <p className="mt-2 text-gray-600">
          Your personal career development platform. Build your path to success.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Resume Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Resume Builder
            </CardTitle>
            <CardDescription>
              Create and manage your professional resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Build a compelling resume with our step-by-step builder and AI-powered suggestions.
            </p>
            <Link href="/dashboard/resume">
              <Button className="w-full">Get Started</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Jobs Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-600" />
              Job Tracker
            </CardTitle>
            <CardDescription>
              Track and manage job opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Save job postings, track applications, and organize your job search.
            </p>
            <Link href="/dashboard/jobs">
              <Button className="w-full">View Jobs</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Analysis Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Career Analysis
            </CardTitle>
            <CardDescription>
              AI-powered insights and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Get personalized analysis of your resume and career transition opportunities.
            </p>
            <Link href="/dashboard/analysis">
              <Button className="w-full">Analyze</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Development Plan Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Development Plan
            </CardTitle>
            <CardDescription>
              Create your career development roadmap
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Build a personalized development plan with milestones and timelines.
            </p>
            <Link href="/dashboard/plan">
              <Button className="w-full">Create Plan</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Progress Tracking
            </CardTitle>
            <CardDescription>
              Monitor your career development progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Track your skills development, learning progress, and career milestones.
            </p>
            <Button className="w-full" variant="outline">Coming Soon</Button>
          </CardContent>
        </Card>

        {/* Timeline Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-600" />
              Career Timeline
            </CardTitle>
            <CardDescription>
              Visualize your career journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              See your career progression and plan future milestones.
            </p>
            <Button className="w-full" variant="outline">Coming Soon</Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/resume">
            <Button variant="outline">Upload Resume</Button>
          </Link>
          <Link href="/dashboard/jobs">
            <Button variant="outline">Add Job Posting</Button>
          </Link>
          <Link href="/dashboard/analysis">
            <Button variant="outline">Run Analysis</Button>
          </Link>
          <Link href="/dashboard/plan">
            <Button variant="outline">Start Planning</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
