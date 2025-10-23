import { ONetSkill } from '@/lib/abstractions/types';

/**
 * Transferable Skills Matcher Service
 *
 * AI-powered service for analyzing transferable skills between career roles.
 * Uses Claude/GPT-4 to identify non-obvious skill transfers and provides
 * confidence scoring on a 0-1 scale. Falls back to O*NET baseline matching
 * if AI analysis fails or times out.
 */

export interface TransferableSkill {
  skillName: string;
  currentLevel: number; // 0-100
  applicabilityToTarget: number; // 0-100
  transferRationale: string;
  confidence: number; // 0-1 scale
}

export interface TransferableSkillsResult {
  transferableSkills: TransferableSkill[];
  transferPatterns: string[];
}

export interface TransferExplanation {
  explanation: string;
  confidence: number; // 0-1 scale
}

export class TransferableSkillsMatcher {
  private readonly AI_TIMEOUT_MS = 30000; // 30 seconds as per spec
  private readonly skillPairCache = new Map<string, TransferableSkillsResult>();

  /**
   * Find transferable skills between current and target roles using AI analysis
   *
   * @param currentSkills - Skills extracted from user's resume
   * @param targetSkills - Required skills for target role from O*NET
   * @param currentRole - User's current role
   * @param targetRole - User's target role
   * @returns Transferable skills analysis with confidence scores
   */
  async findTransferableSkills(
    currentSkills: Array<{ name: string; level: string }>,
    targetSkills: ONetSkill[],
    currentRole: string,
    targetRole: string
  ): Promise<TransferableSkillsResult> {
    // Check cache first
    const cacheKey = this.generateCacheKey(currentRole, targetRole, currentSkills, targetSkills);
    if (this.skillPairCache.has(cacheKey)) {
      console.log('Using cached transferable skills analysis');
      return this.skillPairCache.get(cacheKey)!;
    }

    try {
      // Attempt AI analysis with timeout
      const aiResult = await this.performAIAnalysis(
        currentSkills,
        targetSkills,
        currentRole,
        targetRole
      );

      // Cache the result
      this.skillPairCache.set(cacheKey, aiResult);

      return aiResult;
    } catch (error) {
      console.warn('AI analysis failed, falling back to O*NET baseline:', error);

      // Fall back to O*NET baseline skill overlap detection
      const baselineResult = this.performBaselineAnalysis(currentSkills, targetSkills);

      return baselineResult;
    }
  }

  /**
   * Explain how a specific skill transfers between contexts
   *
   * @param skillName - Name of the skill to explain
   * @param currentContext - Current role/industry context
   * @param targetContext - Target role/industry context
   * @returns Explanation with confidence score
   */
  async explainTransfer(
    skillName: string,
    currentContext: string,
    targetContext: string
  ): Promise<string> {
    try {
      const prompt = this.buildExplanationPrompt(skillName, currentContext, targetContext);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.AI_TIMEOUT_MS);

      const response = await fetch('/api/skill-gap/explain-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skillName,
          currentContext,
          targetContext,
          prompt,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();

      return result.explanation || 'No explanation available';
    } catch (error) {
      console.error('Error explaining transfer:', error);

      // Return fallback explanation
      return `${skillName} may transfer from ${currentContext} to ${targetContext} depending on how it was applied in your previous role.`;
    }
  }

  /**
   * Calculate transfer confidence score based on skill, explanation, and target skill
   *
   * @param skill - Resume skill with name and level
   * @param explanation - Transfer rationale text
   * @param targetSkill - Target skill from O*NET with importance/level
   * @returns Confidence score (0-1)
   */
  calculateTransferConfidence(
    skill: { name: string; level: string },
    explanation: string,
    targetSkill: ONetSkill
  ): number {
    // Convert skill level to numeric
    const currentLevel = this.normalizeLevelToNumber(skill.level);

    // Check for direct skill name match
    const isDirectMatch = skill.name.toLowerCase() === targetSkill.skillName.toLowerCase();

    // Base confidence on skill level match and importance
    const levelFactor = currentLevel / 100;
    const importanceFactor = targetSkill.importance / 100;

    // Analyze explanation strength
    const explanationStrength = this.analyzeExplanationStrength(explanation);

    // Direct match bonus
    const directMatchBonus = isDirectMatch ? 0.2 : 0;

    // Weighted calculation
    const confidence = (
      levelFactor * 0.3 +
      importanceFactor * 0.3 +
      explanationStrength * 0.2 +
      directMatchBonus
    );

    // Clamp to 0-1 range
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Detect transferable skills using O*NET baseline (no AI)
   * Public method for testing and fallback scenarios
   *
   * @param currentSkills - Skills from user's resume
   * @param targetSkills - Required skills for target role
   * @returns Transferable skills with confidence scores
   */
  detectONetBaseline(
    currentSkills: Array<{ name: string; level: string }>,
    targetSkills: ONetSkill[]
  ): TransferableSkill[] {
    const transferableSkills: TransferableSkill[] = [];

    // Find exact and partial matches
    for (const currentSkill of currentSkills) {
      for (const targetSkill of targetSkills) {
        const similarity = this.calculateSkillSimilarity(
          currentSkill.name,
          targetSkill.skillName
        );

        if (similarity > 0.5) {
          // Significant overlap
          const currentLevel = this.normalizeLevelToNumber(currentSkill.level);

          transferableSkills.push({
            skillName: currentSkill.name,
            currentLevel,
            applicabilityToTarget: Math.round(similarity * targetSkill.importance),
            transferRationale: similarity > 0.9
              ? `Direct match with target skill: ${targetSkill.skillName}`
              : `Similar to target skill: ${targetSkill.skillName}`,
            confidence: similarity,
          });
        }
      }
    }

    // Sort by confidence
    transferableSkills.sort((a, b) => b.confidence - a.confidence);

    return transferableSkills;
  }

  /**
   * Perform AI-powered transferable skills analysis using Claude/GPT-4
   */
  private async performAIAnalysis(
    currentSkills: Array<{ name: string; level: string }>,
    targetSkills: ONetSkill[],
    currentRole: string,
    targetRole: string
  ): Promise<TransferableSkillsResult> {
    const prompt = this.buildAIPrompt(currentSkills, targetSkills, currentRole, targetRole);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.AI_TIMEOUT_MS);

    try {
      const response = await fetch('/api/skill-gap/transferable-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentSkills,
          targetSkills,
          currentRole,
          targetRole,
          prompt,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI analysis API returned ${response.status}`);
      }

      const result = await response.json();

      // Validate and normalize response
      return this.validateAIResponse(result);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Build AI prompt template for skill transfer analysis
   */
  private buildAIPrompt(
    currentSkills: Array<{ name: string; level: string }>,
    targetSkills: ONetSkill[],
    currentRole: string,
    targetRole: string
  ): string {
    const currentSkillsList = currentSkills
      .map(s => `- ${s.name} (${s.level})`)
      .join('\n');

    const targetSkillsList = targetSkills
      .map(s => `- ${s.skillName} (Importance: ${s.importance}/100, Level: ${s.level}/100)`)
      .join('\n');

    return `You are a career transition expert analyzing transferable skills.

Analyze transferable skills from the current role to the target role.

CURRENT ROLE: ${currentRole}
CURRENT ROLE SKILLS:
${currentSkillsList}

TARGET ROLE: ${targetRole}
TARGET ROLE REQUIREMENTS (from O*NET):
${targetSkillsList}

For each current skill, determine if it transfers to the target role. Consider:
1. Direct skill overlap (same skill, different context)
2. Adjacent skills (e.g., Python → JavaScript for developers)
3. Meta-skills (e.g., Project Management → Leadership)
4. Domain knowledge transfer (e.g., Finance domain → FinTech roles)

Return JSON in this exact format:
{
  "transferableSkills": [
    {
      "skillName": "string",
      "currentLevel": 0-100,
      "applicabilityToTarget": 0-100,
      "transferRationale": "explanation",
      "confidence": 0-1
    }
  ],
  "transferPatterns": ["pattern1", "pattern2"]
}

Only include skills that have meaningful transferability (confidence >= 0.4).`;
  }

  /**
   * Build prompt for explaining individual skill transfers
   */
  private buildExplanationPrompt(
    skillName: string,
    currentContext: string,
    targetContext: string
  ): string {
    return `Explain how the skill "${skillName}" transfers from ${currentContext} to ${targetContext}.

Provide a clear, specific explanation that highlights:
1. How the skill was likely used in the current context
2. How it applies to the target context
3. Any adaptations or additional learning needed
4. Confidence in this transfer (0-1 scale)

Return JSON: { "explanation": "...", "confidence": 0-1 }`;
  }

  /**
   * Validate and normalize AI response
   */
  private validateAIResponse(response: any): TransferableSkillsResult {
    if (!response.transferableSkills || !Array.isArray(response.transferableSkills)) {
      console.warn('Invalid AI response format, using empty result');
      return {
        transferableSkills: [],
        transferPatterns: [],
      };
    }

    // Validate each skill has required fields
    const validatedSkills = response.transferableSkills
      .filter((skill: any) => {
        return (
          skill.skillName &&
          typeof skill.currentLevel === 'number' &&
          typeof skill.applicabilityToTarget === 'number' &&
          skill.transferRationale &&
          typeof skill.confidence === 'number'
        );
      })
      .map((skill: any) => ({
        skillName: skill.skillName,
        currentLevel: Math.max(0, Math.min(100, skill.currentLevel)),
        applicabilityToTarget: Math.max(0, Math.min(100, skill.applicabilityToTarget)),
        transferRationale: skill.transferRationale,
        confidence: Math.max(0, Math.min(1, skill.confidence)),
      }));

    return {
      transferableSkills: validatedSkills,
      transferPatterns: Array.isArray(response.transferPatterns) ? response.transferPatterns : [],
    };
  }

  /**
   * Perform O*NET baseline skill overlap detection (fallback)
   */
  private performBaselineAnalysis(
    currentSkills: Array<{ name: string; level: string }>,
    targetSkills: ONetSkill[]
  ): TransferableSkillsResult {
    const transferableSkills = this.detectONetBaseline(currentSkills, targetSkills);

    return {
      transferableSkills,
      transferPatterns: transferableSkills.length > 0
        ? ['Direct skill overlap']
        : [],
    };
  }

  /**
   * Calculate similarity between two skill names
   */
  private calculateSkillSimilarity(skill1: string, skill2: string): number {
    const s1 = skill1.toLowerCase().trim();
    const s2 = skill2.toLowerCase().trim();

    // Exact match
    if (s1 === s2) {
      return 1.0;
    }

    // Contains match
    if (s1.includes(s2) || s2.includes(s1)) {
      return 0.9;
    }

    // Word overlap
    const words1 = new Set(s1.split(/\s+/));
    const words2 = new Set(s2.split(/\s+/));

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    if (union.size === 0) return 0;

    // Jaccard similarity
    return intersection.size / union.size;
  }

  /**
   * Normalize skill level string to number (0-100)
   */
  private normalizeLevelToNumber(level: string): number {
    const levelMap: Record<string, number> = {
      beginner: 25,
      intermediate: 50,
      advanced: 75,
      expert: 95,
    };

    return levelMap[level.toLowerCase()] || 50;
  }

  /**
   * Analyze explanation text to estimate strength
   */
  private analyzeExplanationStrength(explanation: string): number {
    if (!explanation || explanation.length < 20) {
      return 0.3; // Weak explanation
    }

    // Count strong indicators
    const strongWords = [
      'directly',
      'essential',
      'critical',
      'fundamental',
      'core',
      'extensively',
      'proven',
    ];

    const weakWords = [
      'might',
      'could',
      'possibly',
      'maybe',
      'somewhat',
      'partially',
    ];

    const lowerExplanation = explanation.toLowerCase();

    const strongCount = strongWords.filter(word => lowerExplanation.includes(word)).length;
    const weakCount = weakWords.filter(word => lowerExplanation.includes(word)).length;

    // Base strength on length and word indicators
    const lengthFactor = Math.min(explanation.length / 200, 1);
    const wordFactor = (strongCount * 0.1) - (weakCount * 0.05);

    return Math.max(0, Math.min(1, 0.5 + lengthFactor * 0.3 + wordFactor));
  }

  /**
   * Generate cache key for skill pair analysis
   */
  private generateCacheKey(
    currentRole: string,
    targetRole: string,
    currentSkills: Array<{ name: string; level: string }>,
    targetSkills: ONetSkill[]
  ): string {
    const currentSkillsStr = currentSkills.map(s => s.name).sort().join(',');
    const targetSkillsStr = targetSkills.map(s => s.skillName).sort().join(',');

    return `${currentRole}|${targetRole}|${currentSkillsStr}|${targetSkillsStr}`;
  }
}
