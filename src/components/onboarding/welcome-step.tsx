import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { CardDescription } from "@/components/ui/card"; // Unused import
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  TrendingUp, 
  // Users, // Unused import 
  FileText, 
  Brain, 
  CheckCircle,
  ArrowRight,
  Star
} from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  const features = [
    {
      icon: FileText,
      title: "Resume Analysis",
      description: "Get instant quality scores and detailed feedback on your resume"
    },
    {
      icon: Brain,
      title: "AI-Powered Coaching",
      description: "Work with our virtual HR coach to improve your resume"
    },
    {
      icon: Target,
      title: "Job Matching",
      description: "Optimize your resume for specific roles and companies"
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description: "Track your progress and plan your path to management"
    }
  ];

  const benefits = [
    "Get noticed by hiring managers",
    "Increase interview callbacks by 3x",
    "Optimize for ATS systems",
    "Stand out from other candidates"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            <Star className="h-4 w-4 mr-2" />
            CareerOS MVP
          </Badge>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to <span className="text-blue-600">CareerOS</span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transform your resume from good to exceptional through intelligent scoring and personalized coaching. 
          Get ready to land your dream management role.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits Section */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            What You&apos;ll Achieve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-green-800">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <p className="text-gray-600">
          Ready to get started? We&apos;ll guide you through uploading your resume and setting up your career goals.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onNext} 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            Get Started
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <Button 
            onClick={onSkip} 
            variant="outline" 
            size="lg"
            className="px-8"
          >
            Skip Onboarding
          </Button>
        </div>
        
        <p className="text-sm text-gray-500">
          You can always complete onboarding later from your dashboard
        </p>
      </div>
    </div>
  );
}
