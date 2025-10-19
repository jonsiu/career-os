/**
 * AI Prompt Templates for Transition Analysis
 *
 * Version: 1.0.0
 * Last Updated: 2025-10-18
 *
 * These prompts are versioned for A/B testing and iteration.
 * All prompts use structured JSON output for consistent parsing.
 */

export const PROMPT_VERSION = '1.0.0';

/**
 * Detect transition type from resume and target role
 * Uses: GPT-4 for structured analysis
 * Output: JSON with transition types and metadata
 */
export const detectTransitionTypePrompt = (
  resumeContent: string,
  currentRole: string,
  targetRole: string,
  targetIndustry?: string
) => ({
  systemPrompt: `You are a career transition analyst specializing in identifying career change patterns. Your role is to analyze career transitions and categorize them accurately.

TRANSITION TYPES:
- cross-role: Changing job function within same industry (e.g., Engineer → Manager, IC → Team Lead)
- cross-industry: Changing industry sector while keeping similar function (e.g., Finance Engineer → Healthcare Engineer)
- cross-function: Changing functional area (e.g., Engineering → Product Management, Marketing → Sales)

HYBRID TRANSITIONS: A person can have multiple transition types simultaneously (e.g., cross-role + cross-industry)

PRIMARY CHALLENGE: When multiple types exist, identify which represents the biggest challenge for the candidate.

OUTPUT FORMAT: Return ONLY valid JSON with no additional text.`,

  userPrompt: `Analyze this career transition and identify the type(s):

CURRENT STATE (from resume):
${resumeContent.substring(0, 2000)}

CURRENT ROLE: ${currentRole}
TARGET ROLE: ${targetRole}
${targetIndustry ? `TARGET INDUSTRY: ${targetIndustry}` : ''}

Provide a detailed analysis in the following JSON format:
{
  "transitionTypes": ["cross-role" | "cross-industry" | "cross-function"],
  "primaryTransitionType": "cross-role" | "cross-industry" | "cross-function",
  "primaryChallengeReason": "Brief explanation of why this is the primary challenge",
  "currentRole": "Extracted current role title",
  "targetRole": "${targetRole}",
  "currentIndustry": "Identified current industry",
  "targetIndustry": "${targetIndustry || 'Not specified'}",
  "transitionDifficulty": "low" | "medium" | "high",
  "confidenceScore": 0.0-1.0
}`,

  model: 'gpt-4',
  temperature: 0.3,
  responseFormat: { type: 'json_object' }
});

/**
 * Generate personalized transition roadmap
 * Uses: Claude for narrative coaching and roadmap planning
 * Output: JSON with timeline, milestones, and bridge roles
 */
export const generateRoadmapPrompt = (
  transitionData: {
    transitionTypes: string[];
    primaryTransitionType: string;
    currentRole?: string;
    targetRole?: string;
    currentIndustry?: string;
    targetIndustry?: string;
  },
  resumeContent: string
) => ({
  systemPrompt: `You are a career development coach specializing in creating realistic, personalized transition roadmaps. Your roadmaps are:

- REALISTIC: Based on actual transition timelines, not overpromising
- PERSONALIZED: Account for the individual's unique background and skills
- ACTIONABLE: Break down into concrete milestones with clear deliverables
- GROWTH-ORIENTED: Focus on skill development and career capital building

ANTI-PATTERNS TO AVOID:
- Do NOT use transactional messaging like "Get hired in 30 days"
- Do NOT create generic one-size-fits-all advice
- Do NOT make unrealistic promises or oversimplify difficulty
- Do NOT focus only on "beating competitors" - emphasize growth and abundance

TIMELINE FACTORS:
- Skill complexity (basic: 4-8 weeks, intermediate: 2-4 months, advanced: 4-8 months)
- Learning velocity (prior learning speed, available time commitment)
- Transition difficulty (cross-role: 6-12 months, cross-industry: 8-16 months, hybrid: 12-18 months)
- Career capital (existing transferable skills reduce timeline)

OUTPUT FORMAT: Return ONLY valid JSON with no additional text.`,

  userPrompt: `Create a personalized transition roadmap for this career change:

TRANSITION DETAILS:
- Type: ${transitionData.transitionTypes.join(', ')}
- Primary Challenge: ${transitionData.primaryTransitionType}
- Current Role: ${transitionData.currentRole}
- Target Role: ${transitionData.targetRole}
- Current Industry: ${transitionData.currentIndustry}
- Target Industry: ${transitionData.targetIndustry}

CURRENT BACKGROUND:
${resumeContent.substring(0, 2000)}

Generate a roadmap in this JSON format:
{
  "estimatedTimeline": {
    "minMonths": number,
    "maxMonths": number,
    "factors": ["Factor 1", "Factor 2", "Factor 3"],
    "reasoning": "Brief explanation of timeline estimate"
  },
  "milestones": [
    {
      "id": "1",
      "title": "Milestone title",
      "description": "What needs to be accomplished",
      "targetDate": "ISO date string (relative to start)",
      "status": "pending",
      "dependencies": ["milestone_id"],
      "effort": number (estimated hours),
      "deliverables": ["Deliverable 1", "Deliverable 2"],
      "successCriteria": "How to know this is complete"
    }
  ],
  "bridgeRoles": ["Intermediate Role 1", "Intermediate Role 2"],
  "bridgeRoleRationale": "Why these bridge roles are recommended",
  "benchmarkData": {
    "similarTransitions": "Description of similar transitions",
    "averageTimeline": "X-Y months",
    "successRate": 0.0-1.0,
    "commonChallenges": ["Challenge 1", "Challenge 2"]
  }
}`,

  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.4,
  maxTokens: 2000
});

/**
 * Analyze skill gaps with criticality and learning time
 * Uses: GPT-4 for structured skill analysis
 * Output: JSON with categorized skills
 */
export const analyzeSkillGapsPrompt = (
  currentRole: string,
  targetRole: string,
  resumeContent: string
) => ({
  systemPrompt: `You are a skills gap analyst specializing in career transitions. Your analysis:

- Identifies CRITICAL skills (must-have for target role)
- Identifies IMPORTANT skills (significantly improve candidacy)
- Identifies NICE-TO-HAVE skills (helpful but not essential)
- Recognizes TRANSFERABLE skills from current role
- Provides REALISTIC learning time estimates

CRITICALITY LEVELS:
- critical: Absolute requirement, role cannot be performed without this
- important: Significantly improves performance and hiring chances
- nice-to-have: Beneficial but not essential, can be learned on the job

LEARNING TIME ESTIMATES (be realistic):
- Basic skills (fundamentals): 4-8 weeks
- Intermediate skills (applied practice): 8-16 weeks
- Advanced skills (mastery): 16-32 weeks
- Leadership/soft skills: Often require on-the-job practice (12-24 weeks minimum)

OUTPUT FORMAT: Return ONLY valid JSON with no additional text.`,

  userPrompt: `Analyze the skill gaps for this career transition:

CURRENT ROLE: ${currentRole}
TARGET ROLE: ${targetRole}

CURRENT SKILLS AND EXPERIENCE:
${resumeContent.substring(0, 2000)}

Provide skill gap analysis in this JSON format:
{
  "criticalSkills": [
    {
      "skill": "Skill name",
      "criticalityLevel": "critical",
      "currentLevel": 0-5,
      "targetLevel": 0-5,
      "transferableFrom": ["Current skill that partially transfers"],
      "onetCode": "O*NET skill code if known",
      "skillComplexity": "basic" | "intermediate" | "advanced",
      "estimatedLearningTime": {
        "minWeeks": number,
        "maxWeeks": number
      },
      "learningPath": "Recommended approach to learn this skill"
    }
  ],
  "importantSkills": [],
  "niceToHaveSkills": [],
  "existingStrengths": ["Skill from current role that transfers well"],
  "overallGapSeverity": "low" | "medium" | "high",
  "developmentPriorities": ["Priority 1", "Priority 2", "Priority 3"]
}`,

  model: 'gpt-4',
  temperature: 0.3,
  responseFormat: { type: 'json_object' }
});

/**
 * Identify bridge roles for difficult transitions
 * Uses: Claude for strategic career path analysis
 * Output: JSON with bridge role recommendations
 */
export const identifyBridgeRolesPrompt = (
  currentRole: string,
  targetRole: string,
  transitionDifficulty: string,
  resumeContent: string
) => ({
  systemPrompt: `You are a career strategist specializing in identifying bridge roles for career transitions.

BRIDGE ROLES: Intermediate positions that:
1. Are attainable from current position (reasonable step up)
2. Build skills and experience needed for target role
3. Reduce risk and timeline for difficult transitions
4. Increase credibility and career capital

WHEN TO RECOMMEND BRIDGE ROLES:
- High difficulty transitions (large skill gaps, experience gaps)
- Multiple simultaneous transition types (hybrid transitions)
- Significant industry or function changes
- Leadership transitions without prior management experience

WHEN NOT TO RECOMMEND:
- Small skill gaps that can be closed through learning
- Natural progression within same track
- Low difficulty transitions

OUTPUT FORMAT: Return ONLY valid JSON with no additional text.`,

  userPrompt: `Identify bridge roles for this transition:

CURRENT ROLE: ${currentRole}
TARGET ROLE: ${targetRole}
DIFFICULTY: ${transitionDifficulty}

CURRENT BACKGROUND:
${resumeContent.substring(0, 1500)}

Provide bridge role recommendations in this JSON format:
{
  "bridgeRolesRecommended": true | false,
  "rationale": "Why bridge roles are or aren't recommended",
  "bridgeRoles": [
    {
      "title": "Bridge role title",
      "reasoning": "Why this is a good intermediate step",
      "skillsGained": ["Skill 1", "Skill 2"],
      "typicalDuration": "X-Y months in this role",
      "transitionPath": "Current → Bridge → Target",
      "successProbability": 0.0-1.0
    }
  ],
  "alternativeApproach": "If bridge roles aren't needed, what's the direct path?"
}`,

  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.4,
  maxTokens: 1500
});

/**
 * Assess career capital and unique skill combinations
 * Uses: Claude for narrative analysis and strategic insights
 * Output: JSON with career capital assessment
 */
export const assessCareerCapitalPrompt = (
  resumeContent: string,
  currentRole: string
) => ({
  systemPrompt: `You are a career capital analyst specializing in identifying rare and valuable skill combinations.

CAREER CAPITAL: The sum of skills, experience, relationships, and reputation that make someone valuable in the job market.

FOCUS ON:
- RARE skill combinations (uncommon but valuable pairings)
- TRANSFERABLE skills (applicable across roles/industries)
- COMPETITIVE advantages (what makes this person stand out)
- MARKET value (how valuable these combinations are)

PHILOSOPHY: Emphasize abundance and exploration rather than competition and scarcity. Help people understand their unique value.

OUTPUT FORMAT: Return ONLY valid JSON with no additional text.`,

  userPrompt: `Assess the career capital for this professional:

CURRENT ROLE: ${currentRole}

BACKGROUND:
${resumeContent.substring(0, 2000)}

Provide career capital assessment in this JSON format:
{
  "uniqueSkills": ["Skill 1", "Skill 2", "Skill 3"],
  "rareSkillCombinations": [
    "Combination 1 (e.g., 'Machine Learning + Healthcare Domain Expertise')",
    "Combination 2"
  ],
  "competitiveAdvantages": [
    "Advantage 1 with specific reasoning",
    "Advantage 2 with specific reasoning"
  ],
  "marketValue": "low" | "medium" | "high",
  "marketValueReasoning": "Why this career capital is valued in the market",
  "recommendedLeverageStrategies": [
    "How to leverage this unique combination",
    "Opportunities that align with these strengths"
  ],
  "potentialCareerPaths": [
    "Path 1 that leverages unique skills",
    "Path 2 that builds on rare combinations"
  ]
}`,

  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.4,
  maxTokens: 1500
});

/**
 * Estimate realistic timeline based on multiple factors
 * Uses: GPT-4 for data-driven timeline calculation
 * Output: JSON with timeline estimate and factors
 */
export const estimateTimelinePrompt = (
  transitionData: any,
  skillGaps: any,
  careerCapital: any
) => ({
  systemPrompt: `You are a data-driven career timeline analyst. Your estimates are:

- REALISTIC: Based on actual transition data and learning curves
- PERSONALIZED: Account for individual circumstances
- TRANSPARENT: Explain the factors affecting the timeline
- HONEST: Don't overpromise or oversimplify

TIMELINE FACTORS:
1. Transition difficulty (cross-role: 6-12mo, cross-industry: 8-16mo, hybrid: 12-18mo)
2. Skill gap severity (high: +4-6mo, medium: +2-3mo, low: +0-1mo)
3. Career capital (strong: -2-4mo, moderate: -0-2mo, weak: +0-2mo)
4. Learning velocity (assume 10-15 hours/week for working professionals)
5. Available resources (courses, mentors, projects)

OUTPUT FORMAT: Return ONLY valid JSON with no additional text.`,

  userPrompt: `Estimate a realistic timeline for this transition:

TRANSITION DATA:
${JSON.stringify(transitionData, null, 2)}

SKILL GAPS:
${JSON.stringify(skillGaps, null, 2)}

CAREER CAPITAL:
${JSON.stringify(careerCapital, null, 2)}

Provide timeline estimate in this JSON format:
{
  "estimatedTimeline": {
    "minMonths": number,
    "maxMonths": number,
    "mostLikelyMonths": number,
    "confidenceLevel": 0.0-1.0
  },
  "factors": [
    {
      "factor": "Factor name",
      "impact": "Increases/Decreases timeline",
      "impactMonths": number,
      "reasoning": "Why this affects timeline"
    }
  ],
  "assumptions": [
    "10-15 hours per week for skill development",
    "Active job search alongside learning",
    "Other assumptions"
  ],
  "accelerators": [
    "What could speed up the transition",
    "Available resources or shortcuts"
  ],
  "riskFactors": [
    "What could slow down the transition",
    "Potential obstacles"
  ]
}`,

  model: 'gpt-4',
  temperature: 0.3,
  responseFormat: { type: 'json_object' }
});

/**
 * Helper function to create versioned prompt with metadata
 */
export function createVersionedPrompt(
  promptFn: (...args: any[]) => any,
  version: string = PROMPT_VERSION
) {
  return (...args: any[]) => {
    const prompt = promptFn(...args);
    return {
      ...prompt,
      version,
      createdAt: new Date().toISOString()
    };
  };
}

/**
 * Export versioned prompts for tracking and A/B testing
 */
export const versionedPrompts = {
  detectTransitionType: createVersionedPrompt(detectTransitionTypePrompt),
  generateRoadmap: createVersionedPrompt(generateRoadmapPrompt),
  analyzeSkillGaps: createVersionedPrompt(analyzeSkillGapsPrompt),
  identifyBridgeRoles: createVersionedPrompt(identifyBridgeRolesPrompt),
  assessCareerCapital: createVersionedPrompt(assessCareerCapitalPrompt),
  estimateTimeline: createVersionedPrompt(estimateTimelinePrompt)
};
