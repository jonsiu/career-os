"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Briefcase, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TargetRoleSelectorProps {
  value: string;
  onetCode?: string;
  onChange: (role: string, onetCode?: string) => void;
}

interface OccupationResult {
  code: string;
  title: string;
  description?: string;
}

export function TargetRoleSelector({ value, onetCode, onChange }: TargetRoleSelectorProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [searchResults, setSearchResults] = useState<OccupationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedOccupation, setSelectedOccupation] = useState<OccupationResult | null>(null);

  // Debounced search function
  const searchOccupations = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(`/api/onet/search?query=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error('Failed to search occupations');
      }

      const data = await response.json();
      setSearchResults(data.occupations || []);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to search occupations:', error);
      toast({
        title: 'Search failed',
        description: 'Failed to search occupations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery && searchQuery !== selectedOccupation?.title) {
        searchOccupations(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedOccupation, searchOccupations]);

  const handleSelectOccupation = (occupation: OccupationResult) => {
    setSelectedOccupation(occupation);
    setSearchQuery(occupation.title);
    setShowResults(false);
    onChange(occupation.title, occupation.code);
  };

  const handleCustomRole = () => {
    // User entered a custom role not from O*NET
    if (searchQuery && searchQuery !== selectedOccupation?.title) {
      setSelectedOccupation(null);
      onChange(searchQuery, undefined);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow click on result
    setTimeout(() => {
      setShowResults(false);
      handleCustomRole();
    }, 200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">What role are you targeting?</h3>
        <p className="text-sm text-gray-600">
          Search for an occupation from the O*NET database, or enter a custom role title.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="target-role">Target Role</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="target-role"
              type="text"
              placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowResults(true);
                }
              }}
              onBlur={handleInputBlur}
              className="pl-10"
              autoComplete="off"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-auto">
              {searchResults.map((occupation) => (
                <button
                  key={occupation.code}
                  type="button"
                  onClick={() => handleSelectOccupation(occupation)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{occupation.title}</div>
                      {occupation.description && (
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {occupation.description}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        O*NET Code: {occupation.code}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Occupation Display */}
        {selectedOccupation && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 mb-1">
                  {selectedOccupation.title}
                </div>
                {selectedOccupation.description && (
                  <div className="text-sm text-gray-700 mb-2">
                    {selectedOccupation.description}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>O*NET Code: {selectedOccupation.code}</span>
                  <a
                    href={`https://www.onetonline.org/link/summary/${selectedOccupation.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    View on O*NET
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Role Indicator */}
        {searchQuery && !selectedOccupation && !isSearching && searchResults.length === 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="font-medium text-yellow-900 mb-1">
                  Custom Role
                </div>
                <div className="text-sm text-yellow-800">
                  We'll analyze your target role "{searchQuery}" based on your description.
                  Note: Custom roles may have less accurate skill requirements compared to O*NET occupations.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Why use O*NET?</h4>
        <p className="text-sm text-gray-600">
          The O*NET database provides standardized skill requirements for over 900 occupations,
          helping us give you accurate, data-driven skill gap analysis.
        </p>
      </div>
    </div>
  );
}
