import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Building2,
  Briefcase,
  MapPin
} from "lucide-react";

interface JobInterestsStepProps {
  onNext: (data: JobInterestsData) => void;
  onBack: () => void;
}

interface JobInterestsData {
  targetRoles: string[];
  industries: string[];
  locations: string[];
  careerLevel: string;
  yearsOfExperience: string;
}

const commonRoles = [
  "Engineering Manager",
  "Product Manager", 
  "Technical Lead",
  "Senior Software Engineer",
  "Data Science Manager",
  "Marketing Manager",
  "Sales Manager",
  "Operations Manager",
  "Project Manager",
  "Design Manager",
  "DevOps Manager",
  "QA Manager"
];

const commonIndustries = [
  "Technology",
  "Healthcare",
  "Finance",
  "E-commerce",
  "Education",
  "Manufacturing",
  "Consulting",
  "Media & Entertainment",
  "Real Estate",
  "Government",
  "Non-profit",
  "Startups"
];

const experienceLevels = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
  { value: "lead", label: "Lead/Principal" },
  { value: "executive", label: "Executive/C-Level" }
];

const yearsOfExperienceOptions = [
  { value: "0-1", label: "0-1 years" },
  { value: "2-3", label: "2-3 years" },
  { value: "4-5", label: "4-5 years" },
  { value: "6-10", label: "6-10 years" },
  { value: "11-15", label: "11-15 years" },
  { value: "16+", label: "16+ years" }
];

export function JobInterestsStep({ onNext, onBack }: JobInterestsStepProps) {
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [careerLevel, setCareerLevel] = useState<string>("");
  const [yearsOfExperience, setYearsOfExperience] = useState<string>("");
  const [customRole, setCustomRole] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [customLocation, setCustomLocation] = useState("");

  const addRole = (role: string) => {
    if (role && !targetRoles.includes(role)) {
      setTargetRoles([...targetRoles, role]);
    }
  };

  const removeRole = (role: string) => {
    setTargetRoles(targetRoles.filter(r => r !== role));
  };

  const addIndustry = (industry: string) => {
    if (industry && !industries.includes(industry)) {
      setIndustries([...industries, industry]);
    }
  };

  const removeIndustry = (industry: string) => {
    setIndustries(industries.filter(i => i !== industry));
  };

  const addLocation = (location: string) => {
    if (location && !locations.includes(location)) {
      setLocations([...locations, location]);
    }
  };

  const removeLocation = (location: string) => {
    setLocations(locations.filter(l => l !== location));
  };

  const handleContinue = () => {
    const data: JobInterestsData = {
      targetRoles,
      industries,
      locations,
      careerLevel,
      yearsOfExperience
    };
    onNext(data);
  };

  const isFormValid = targetRoles.length > 0 && industries.length > 0 && careerLevel && yearsOfExperience;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-green-100 rounded-full">
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Tell Us About Your Goals</h2>
        <p className="text-gray-600">
          Help us personalize your experience by sharing your career interests and target roles.
        </p>
      </div>

      {/* Target Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Target Roles
          </CardTitle>
          <CardDescription>
            What management or leadership roles are you interested in?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Roles */}
          {targetRoles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {targetRoles.map((role) => (
                <Badge key={role} variant="secondary" className="px-3 py-1">
                  {role}
                  <button
                    onClick={() => removeRole(role)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Common Roles */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Popular Roles</Label>
            <div className="flex flex-wrap gap-2">
              {commonRoles.map((role) => (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  onClick={() => addRole(role)}
                  disabled={targetRoles.includes(role)}
                  className="text-xs"
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Role Input */}
          <div className="flex gap-2">
            <Input
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="Add custom role..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addRole(customRole);
                  setCustomRole("");
                }
              }}
            />
            <Button
              onClick={() => {
                addRole(customRole);
                setCustomRole("");
              }}
              disabled={!customRole.trim()}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Industries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Industries
          </CardTitle>
          <CardDescription>
            Which industries interest you most?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Industries */}
          {industries.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {industries.map((industry) => (
                <Badge key={industry} variant="secondary" className="px-3 py-1">
                  {industry}
                  <button
                    onClick={() => removeIndustry(industry)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Common Industries */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Popular Industries</Label>
            <div className="flex flex-wrap gap-2">
              {commonIndustries.map((industry) => (
                <Button
                  key={industry}
                  variant="outline"
                  size="sm"
                  onClick={() => addIndustry(industry)}
                  disabled={industries.includes(industry)}
                  className="text-xs"
                >
                  {industry}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Industry Input */}
          <div className="flex gap-2">
            <Input
              value={customIndustry}
              onChange={(e) => setCustomIndustry(e.target.value)}
              placeholder="Add custom industry..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addIndustry(customIndustry);
                  setCustomIndustry("");
                }
              }}
            />
            <Button
              onClick={() => {
                addIndustry(customIndustry);
                setCustomIndustry("");
              }}
              disabled={!customIndustry.trim()}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Career Level */}
      <Card>
        <CardHeader>
          <CardTitle>Career Level</CardTitle>
          <CardDescription>
            What's your current career level or the level you're targeting?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {experienceLevels.map((level) => (
              <label key={level.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="careerLevel"
                  value={level.value}
                  checked={careerLevel === level.value}
                  onChange={(e) => setCareerLevel(e.target.value)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm">{level.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Years of Experience */}
      <Card>
        <CardHeader>
          <CardTitle>Years of Experience</CardTitle>
          <CardDescription>
            How many years of professional experience do you have?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {yearsOfExperienceOptions.map((years) => (
              <label key={years.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="yearsOfExperience"
                  value={years.value}
                  checked={yearsOfExperience === years.value}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm">{years.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Locations (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Preferred Locations (Optional)
          </CardTitle>
          <CardDescription>
            Where would you like to work? Leave blank if location doesn't matter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Locations */}
          {locations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {locations.map((location) => (
                <Badge key={location} variant="secondary" className="px-3 py-1">
                  {location}
                  <button
                    onClick={() => removeLocation(location)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Custom Location Input */}
          <div className="flex gap-2">
            <Input
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="Add location (e.g., San Francisco, Remote, New York)..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLocation(customLocation);
                  setCustomLocation("");
                }
              }}
            />
            <Button
              onClick={() => {
                addLocation(customLocation);
                setCustomLocation("");
              }}
              disabled={!customLocation.trim()}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button 
          onClick={handleContinue}
          disabled={!isFormValid}
          className="bg-green-600 hover:bg-green-700"
        >
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
