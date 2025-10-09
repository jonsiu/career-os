import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Chrome,
  Firefox,
  Safari,
  Edge,
  Zap,
  Bookmark,
  Target,
  Info
} from "lucide-react";

interface BrowserExtensionStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const browsers = [
  { name: "Chrome", icon: Chrome, color: "text-green-600" },
  { name: "Firefox", icon: Firefox, color: "text-orange-600" },
  { name: "Safari", icon: Safari, color: "text-blue-600" },
  { name: "Edge", icon: Edge, color: "text-blue-700" }
];

const extensionFeatures = [
  {
    icon: Bookmark,
    title: "Job Bookmarking",
    description: "Save interesting job postings with one click"
  },
  {
    icon: Target,
    title: "Resume Matching",
    description: "See how well your resume matches job requirements"
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    description: "Get real-time feedback on job postings"
  }
];

export function BrowserExtensionStep({ onNext, onBack, onSkip }: BrowserExtensionStepProps) {
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [detectedBrowser, setDetectedBrowser] = useState<string>("");
  const [installationStep, setInstallationStep] = useState<'detect' | 'install' | 'verify'>('detect');

  useEffect(() => {
    // Detect browser
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) {
      setDetectedBrowser('Chrome');
    } else if (userAgent.includes('Firefox')) {
      setDetectedBrowser('Firefox');
    } else if (userAgent.includes('Safari')) {
      setDetectedBrowser('Safari');
    } else if (userAgent.includes('Edge')) {
      setDetectedBrowser('Edge');
    } else {
      setDetectedBrowser('Chrome'); // Default to Chrome
    }
  }, []);

  const handleInstallClick = () => {
    setInstallationStep('install');
    // In a real implementation, this would redirect to the browser extension store
    // For now, we'll simulate the installation process
    setTimeout(() => {
      setExtensionInstalled(true);
      setInstallationStep('verify');
    }, 2000);
  };

  const handleContinue = () => {
    onNext();
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-purple-100 rounded-full">
            <Download className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Install Browser Extension</h2>
        <p className="text-gray-600">
          Install our browser extension to bookmark jobs and get instant resume analysis while browsing.
        </p>
      </div>

      {/* Benefits */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-800">Why Install the Extension?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {extensionFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <feature.icon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-purple-900">{feature.title}</h4>
                  <p className="text-sm text-purple-700">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Browser Detection */}
      {installationStep === 'detect' && (
        <Card>
          <CardHeader>
            <CardTitle>Detected Browser</CardTitle>
            <CardDescription>
              We detected you're using {detectedBrowser}. Click below to install the extension.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-4 p-6 bg-gray-50 rounded-lg">
              {browsers.map((browser) => (
                <div
                  key={browser.name}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg ${
                    browser.name === detectedBrowser 
                      ? 'bg-white shadow-md border-2 border-blue-200' 
                      : 'opacity-50'
                  }`}
                >
                  <browser.icon className={`h-8 w-8 ${browser.color}`} />
                  <span className="text-sm font-medium">{browser.name}</span>
                  {browser.name === detectedBrowser && (
                    <Badge variant="secondary" className="text-xs">Detected</Badge>
                  )}
                </div>
              ))}
            </div>

            <Button 
              onClick={handleInstallClick}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Install CareerOS Extension for {detectedBrowser}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Installation Process */}
      {installationStep === 'install' && (
        <Card>
          <CardHeader>
            <CardTitle>Installing Extension...</CardTitle>
            <CardDescription>
              Please follow the installation steps in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <span className="text-sm">Click "Add to {detectedBrowser}" in the popup</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <span className="text-sm">Confirm the installation</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <span className="text-sm">Extension will be added to your browser</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Once installed, the extension will automatically sync with your CareerOS account.
              </p>
              <Button 
                onClick={() => setExtensionInstalled(true)}
                variant="outline"
                className="w-full"
              >
                I've Installed the Extension
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification */}
      {installationStep === 'verify' && extensionInstalled && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Extension Installed Successfully!
                </h3>
                <p className="text-green-700">
                  You can now bookmark jobs and get instant resume analysis while browsing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Extension Features:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Bookmark jobs from LinkedIn, Indeed, and other job sites</li>
                <li>• Get instant resume compatibility scores</li>
                <li>• Sync bookmarked jobs with your CareerOS dashboard</li>
                <li>• Receive personalized job recommendations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleSkip}
            variant="outline"
          >
            Skip for Now
          </Button>
          
          <Button 
            onClick={handleContinue}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
