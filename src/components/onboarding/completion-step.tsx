import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  ArrowRight,
  BarChart3,
  Brain,
  Target,
  Download,
  Sparkles,
  Trophy
} from "lucide-react";

interface CompletionStepProps {
  onComplete: () => void;
  resumeTitle?: string;
  targetRoles?: string[];
  extensionInstalled?: boolean;
}

export function CompletionStep({ 
  onComplete, 
  resumeTitle, 
  targetRoles = [], 
  extensionInstalled = false 
}: CompletionStepProps) {
  const completedSteps = [
    {
      icon: CheckCircle,
      title: "Resume Uploaded",
      description: resumeTitle || "Your resume has been uploaded and analyzed",
      completed: true
    },
    {
      icon: Target,
      title: "Goals Set",
      description: `Targeting ${targetRoles.length} role${targetRoles.length !== 1 ? 's' : ''}: ${targetRoles.slice(0, 2).join(', ')}${targetRoles.length > 2 ? '...' : ''}`,
      completed: targetRoles.length > 0
    },
    {
      icon: Download,
      title: "Extension Installed",
      description: extensionInstalled ? "Browser extension is ready to use" : "Extension installation skipped",
      completed: extensionInstalled
    }
  ];

  const nextSteps = [
    {
      icon: BarChart3,
      title: "Analyze Your Resume",
      description: "Get detailed feedback and improvement recommendations",
      action: "View Analysis"
    },
    {
      icon: Brain,
      title: "Start Coaching Session",
      description: "Work with our AI coach to improve your resume",
      action: "Begin Coaching"
    },
    {
      icon: Target,
      title: "Browse Jobs",
      description: "Find and bookmark relevant job opportunities",
      action: "Explore Jobs"
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-green-100 rounded-full">
            <Trophy className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Welcome to CareerOS!</h2>
        <p className="text-lg text-gray-600">
          You're all set up and ready to accelerate your career growth.
        </p>
        <Badge variant="secondary" className="text-sm px-4 py-2">
          <Sparkles className="h-4 w-4 mr-2" />
          Onboarding Complete
        </Badge>
      </div>

      {/* Completed Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What You've Accomplished</CardTitle>
          <CardDescription>
            Here's what we've set up for you:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${step.completed ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <step.icon className={`h-5 w-5 ${step.completed ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.title}
                  </h4>
                  <p className={`text-sm ${step.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                    {step.description}
                  </p>
                </div>
                {step.completed && (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Ready to Get Started?</CardTitle>
          <CardDescription className="text-blue-700">
            Here are your next steps to maximize your career potential:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nextSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-blue-100">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <step.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{step.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    {step.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pro Tips */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-800">Pro Tips for Success</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-purple-700">
                <strong>Regular Updates:</strong> Update your resume regularly as you gain new skills and experience.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-purple-700">
                <strong>Use the Extension:</strong> Bookmark jobs that interest you to build a targeted job search strategy.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-purple-700">
                <strong>AI Coaching:</strong> Use our virtual HR coach to get personalized feedback and improvement suggestions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final CTA */}
      <div className="text-center space-y-4">
        <p className="text-gray-600">
          You're ready to take your career to the next level. Let's get started!
        </p>
        
        <Button 
          onClick={onComplete}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-8"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
