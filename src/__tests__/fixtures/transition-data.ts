/**
 * Test Fixtures for Transition Type Identification & Planning Feature
 *
 * These fixtures provide sample data for testing transition-related functionality:
 * - Resume content for transition analysis
 * - Sample transition plans (cross-role, cross-industry, hybrid)
 * - Skill gaps with O*NET codes
 * - Course recommendations with affiliate links
 * - Benchmarking data
 * - Mock API responses
 */

export const sampleResumeContent = {
  // Software Engineer looking to transition to Engineering Manager (cross-role)
  softwareEngineer: {
    content: `
PROFESSIONAL SUMMARY
Senior Software Engineer with 6 years of experience in full-stack development.
Expert in React, Node.js, TypeScript, and cloud infrastructure (AWS, GCP).
Led technical design for 3 major product features. Mentored 4 junior engineers.

EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2021-Present
- Led architecture design for customer analytics platform (React, Node.js, PostgreSQL)
- Mentored team of 4 junior engineers on best practices and code reviews
- Improved API performance by 40% through optimization
- Collaborated with product managers on feature prioritization

Software Engineer II | StartupXYZ | 2019-2021
- Built scalable microservices using Node.js and Docker
- Implemented CI/CD pipelines reducing deployment time by 60%
- Worked in Agile teams with 2-week sprint cycles

Software Engineer I | DevShop | 2018-2019
- Developed responsive web applications using React and Redux
- Wrote unit and integration tests achieving 85% code coverage
- Participated in on-call rotations for production support

SKILLS
Technical: JavaScript, TypeScript, React, Node.js, PostgreSQL, MongoDB, AWS, Docker, Git
Soft Skills: Team collaboration, mentoring, technical documentation, problem-solving
    `.trim(),
    currentRole: 'Senior Software Engineer',
    currentIndustry: 'Technology',
    yearsExperience: 6,
  },

  // Marketing Manager looking to transition to Product Manager (cross-function)
  marketingManager: {
    content: `
PROFESSIONAL SUMMARY
Marketing Manager with 5 years of experience in digital marketing and product launches.
Data-driven approach to campaign optimization. Strong cross-functional collaboration skills.

EXPERIENCE
Marketing Manager | E-commerce Co. | 2021-Present
- Managed product launch campaigns reaching 2M+ users
- Analyzed user behavior data to optimize conversion funnels
- Collaborated with product, engineering, and design teams on feature releases
- Conducted user research and A/B testing for marketing initiatives

Marketing Specialist | Growth Startup | 2019-2021
- Executed growth marketing experiments across channels
- Used analytics tools (Google Analytics, Mixpanel) for data-driven decisions
- Coordinated with product team on feature adoption campaigns

SKILLS
Marketing: Digital marketing, campaign management, SEO/SEM, content strategy, analytics
Tools: Google Analytics, Mixpanel, Figma, SQL (basic), Jira
Soft Skills: Cross-functional collaboration, data analysis, user research, communication
    `.trim(),
    currentRole: 'Marketing Manager',
    currentIndustry: 'Technology',
    yearsExperience: 5,
  },

  // Teacher transitioning to Corporate Trainer (cross-industry)
  teacher: {
    content: `
PROFESSIONAL SUMMARY
High School English Teacher with 8 years of experience in curriculum design and student engagement.
Skilled in creating interactive learning experiences and measuring learning outcomes.

EXPERIENCE
High School English Teacher | Public School District | 2016-Present
- Designed and delivered curriculum for 120+ students per year
- Created interactive learning modules increasing student engagement by 30%
- Facilitated professional development workshops for fellow teachers
- Developed assessment frameworks to measure learning outcomes

SKILLS
Teaching: Curriculum design, lesson planning, student assessment, differentiated instruction
Tools: Google Classroom, Zoom, Canva, Microsoft Office
Soft Skills: Public speaking, facilitation, empathy, adaptability, feedback delivery
    `.trim(),
    currentRole: 'High School Teacher',
    currentIndustry: 'Education',
    yearsExperience: 8,
  },
};

export const sampleTransitionPlans = {
  // Cross-role transition: Senior Engineer to Engineering Manager
  crossRole: {
    userId: 'user_test_123',
    title: 'Transition to Engineering Manager',
    description: 'Move from Senior Software Engineer to Engineering Manager role',
    transitionTypes: ['cross-role'],
    primaryTransitionType: 'cross-role',
    currentRole: 'Senior Software Engineer',
    targetRole: 'Engineering Manager',
    currentIndustry: 'Technology',
    targetIndustry: 'Technology',
    bridgeRoles: ['Tech Lead', 'Senior Engineer II'],
    estimatedTimeline: {
      minMonths: 8,
      maxMonths: 12,
      factors: [
        'Already has mentoring experience',
        'Needs to develop people management skills',
        'Requires understanding of business metrics',
        'Must build stakeholder communication skills',
      ],
    },
    benchmarkData: {
      similarTransitions: 'Senior Engineer to Engineering Manager',
      averageTimeline: '10-14 months',
      successRate: 75,
    },
    progressPercentage: 25,
    careerCapitalAssessment: {
      uniqueSkills: ['Technical architecture', 'Mentoring', 'Cross-functional collaboration'],
      rareSkillCombinations: ['Deep technical expertise + team leadership'],
      competitiveAdvantages: [
        'Can lead both technical and people discussions',
        'Credibility with engineering team',
        'Understand technical trade-offs',
      ],
    },
  },

  // Cross-function transition: Marketing to Product Management
  crossFunction: {
    userId: 'user_test_456',
    title: 'Transition to Product Manager',
    description: 'Move from Marketing Manager to Product Manager role',
    transitionTypes: ['cross-function'],
    primaryTransitionType: 'cross-function',
    currentRole: 'Marketing Manager',
    targetRole: 'Product Manager',
    currentIndustry: 'Technology',
    targetIndustry: 'Technology',
    bridgeRoles: ['Product Marketing Manager', 'Growth PM'],
    estimatedTimeline: {
      minMonths: 10,
      maxMonths: 15,
      factors: [
        'Has cross-functional collaboration experience',
        'Needs to learn product development lifecycle',
        'Must develop technical fluency',
        'Requires roadmap prioritization skills',
      ],
    },
    benchmarkData: {
      similarTransitions: 'Marketing to Product Management',
      averageTimeline: '12-18 months',
      successRate: 65,
    },
    progressPercentage: 15,
    careerCapitalAssessment: {
      uniqueSkills: ['User research', 'Data analysis', 'Go-to-market strategy'],
      rareSkillCombinations: ['Marketing expertise + product thinking'],
      competitiveAdvantages: [
        'Deep understanding of customer acquisition',
        'Data-driven decision making',
        'Strong communication skills',
      ],
    },
  },

  // Cross-industry transition: Teacher to Corporate Trainer
  crossIndustry: {
    userId: 'user_test_789',
    title: 'Transition to Corporate Trainer',
    description: 'Move from Education to Corporate L&D',
    transitionTypes: ['cross-industry'],
    primaryTransitionType: 'cross-industry',
    currentRole: 'High School Teacher',
    targetRole: 'Corporate Trainer',
    currentIndustry: 'Education',
    targetIndustry: 'Technology',
    bridgeRoles: [],
    estimatedTimeline: {
      minMonths: 6,
      maxMonths: 10,
      factors: [
        'Strong curriculum design skills transfer well',
        'Needs to adapt to corporate environment',
        'Must learn business context and ROI measurement',
        'Requires familiarity with corporate training tools',
      ],
    },
    benchmarkData: {
      similarTransitions: 'Teacher to Corporate Training',
      averageTimeline: '6-12 months',
      successRate: 80,
    },
    progressPercentage: 40,
    careerCapitalAssessment: {
      uniqueSkills: ['Curriculum design', 'Facilitation', 'Assessment design'],
      rareSkillCombinations: ['Teaching expertise + adult learning principles'],
      competitiveAdvantages: [
        'Experienced in creating engaging learning experiences',
        'Skilled at measuring learning outcomes',
        'Adaptable to different learning styles',
      ],
    },
  },

  // Hybrid transition: Engineer changing both role and industry
  hybrid: {
    userId: 'user_test_101',
    title: 'Transition to Healthcare Product Manager',
    description: 'Move from Software Engineer (Tech) to Product Manager (Healthcare)',
    transitionTypes: ['cross-role', 'cross-industry'],
    primaryTransitionType: 'cross-industry', // Industry change is primary challenge
    currentRole: 'Software Engineer',
    targetRole: 'Product Manager',
    currentIndustry: 'Technology',
    targetIndustry: 'Healthcare',
    bridgeRoles: ['Technical Product Manager (Tech)', 'Healthcare IT Consultant'],
    estimatedTimeline: {
      minMonths: 14,
      maxMonths: 20,
      factors: [
        'Simultaneous role and industry change increases complexity',
        'Must learn healthcare domain knowledge (HIPAA, regulations)',
        'Needs product management skills',
        'Requires understanding of healthcare stakeholders',
      ],
    },
    benchmarkData: {
      similarTransitions: 'Tech Engineer to Healthcare PM',
      averageTimeline: '16-24 months',
      successRate: 50,
    },
    progressPercentage: 10,
    careerCapitalAssessment: {
      uniqueSkills: ['Software engineering', 'Technical architecture'],
      rareSkillCombinations: ['Technical depth + healthcare domain'],
      competitiveAdvantages: [
        'Can bridge technical and clinical teams',
        'Understand technical feasibility',
        'Credibility with engineering teams',
      ],
    },
  },
};

export const sampleSkillGaps = {
  // Skills for Senior Engineer → Engineering Manager transition
  engineerToManager: [
    {
      name: 'People Management',
      currentLevel: 1,
      targetLevel: 4,
      criticalityLevel: 'critical' as const,
      transferableFrom: ['Mentoring junior engineers'],
      onetCode: '2.C.1.a',
      skillComplexity: 'advanced' as const,
      estimatedLearningTime: {
        minWeeks: 12,
        maxWeeks: 24,
      },
      affiliateCourses: [
        {
          provider: 'Coursera',
          title: 'Managing People and Teams',
          url: 'https://www.coursera.org/specializations/managing-people-teams',
          affiliateLink: 'https://www.coursera.org/specializations/managing-people-teams?utm_source=careeros&utm_medium=affiliate&utm_campaign=transition',
          price: 49,
        },
        {
          provider: 'LinkedIn Learning',
          title: 'New Manager Foundations',
          url: 'https://www.linkedin.com/learning/new-manager-foundations',
          affiliateLink: 'https://www.linkedin.com/learning/new-manager-foundations?trk=affiliate_careeros',
          price: 29.99,
        },
      ],
    },
    {
      name: 'Strategic Thinking',
      currentLevel: 2,
      targetLevel: 4,
      criticalityLevel: 'critical' as const,
      transferableFrom: ['Technical architecture planning'],
      onetCode: '2.B.1.a',
      skillComplexity: 'advanced' as const,
      estimatedLearningTime: {
        minWeeks: 8,
        maxWeeks: 16,
      },
      affiliateCourses: [
        {
          provider: 'Udemy',
          title: 'Strategic Thinking and Planning',
          url: 'https://www.udemy.com/course/strategic-thinking/',
          affiliateLink: 'https://www.udemy.com/course/strategic-thinking/?ref=careeros',
          price: 84.99,
        },
      ],
    },
    {
      name: 'Business Metrics & KPIs',
      currentLevel: 1,
      targetLevel: 4,
      criticalityLevel: 'important' as const,
      transferableFrom: [],
      onetCode: '2.A.2.a',
      skillComplexity: 'intermediate' as const,
      estimatedLearningTime: {
        minWeeks: 6,
        maxWeeks: 10,
      },
      affiliateCourses: [
        {
          provider: 'Coursera',
          title: 'Business Metrics for Data-Driven Companies',
          url: 'https://www.coursera.org/learn/analytics-business-metrics',
          affiliateLink: 'https://www.coursera.org/learn/analytics-business-metrics?utm_source=careeros',
          price: 49,
        },
      ],
    },
    {
      name: 'Stakeholder Management',
      currentLevel: 2,
      targetLevel: 4,
      criticalityLevel: 'important' as const,
      transferableFrom: ['Cross-functional collaboration'],
      onetCode: '2.C.9.a',
      skillComplexity: 'intermediate' as const,
      estimatedLearningTime: {
        minWeeks: 4,
        maxWeeks: 8,
      },
      affiliateCourses: [],
    },
    {
      name: 'Hiring & Interviewing',
      currentLevel: 1,
      targetLevel: 3,
      criticalityLevel: 'nice-to-have' as const,
      transferableFrom: [],
      onetCode: '2.C.1.b',
      skillComplexity: 'basic' as const,
      estimatedLearningTime: {
        minWeeks: 2,
        maxWeeks: 4,
      },
      affiliateCourses: [
        {
          provider: 'LinkedIn Learning',
          title: 'Hiring and Onboarding New Employees',
          url: 'https://www.linkedin.com/learning/hiring-onboarding',
          affiliateLink: 'https://www.linkedin.com/learning/hiring-onboarding?trk=affiliate_careeros',
          price: 29.99,
        },
      ],
    },
  ],
};

export const mockOnetApiResponses = {
  // Mock O*NET API response for skill validation
  skillValidation: {
    'People Management': {
      element_id: '2.C.1.a',
      element_name: 'Management of Personnel Resources',
      description: 'Motivating, developing, and directing people as they work, identifying the best people for the job.',
      scale: {
        id: '1',
        name: 'Importance',
      },
      value: {
        value: 4.5,
        description: 'Very Important',
      },
    },
    'Strategic Thinking': {
      element_id: '2.B.1.a',
      element_name: 'Judgment and Decision Making',
      description: 'Considering the relative costs and benefits of potential actions to choose the most appropriate one.',
      scale: {
        id: '1',
        name: 'Importance',
      },
      value: {
        value: 4.8,
        description: 'Extremely Important',
      },
    },
  },

  // Mock O*NET API response for job-to-skills mapping
  jobSkillsMapping: {
    'Engineering Manager': {
      occupation: {
        code: '11-3021.00',
        title: 'Computer and Information Systems Managers',
      },
      skills: [
        {
          element_id: '2.C.1.a',
          element_name: 'Management of Personnel Resources',
          scale_value: 4.5,
        },
        {
          element_id: '2.B.1.a',
          element_name: 'Judgment and Decision Making',
          scale_value: 4.8,
        },
        {
          element_id: '2.A.2.a',
          element_name: 'Mathematics',
          scale_value: 3.9,
        },
      ],
    },
  },

  // Mock error response
  error: {
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: 'The requested resource was not found',
    },
  },
};

export const mockCourseApiResponses = {
  // Mock Coursera API response
  coursera: {
    elements: [
      {
        id: 'managing-people-teams',
        name: 'Managing People and Teams Specialization',
        description: 'Learn the fundamentals of people management',
        primaryLanguages: ['en'],
        partnerIds: ['wharton'],
        productDifficultyLevel: 'BEGINNER',
        s12nId: 'managing-people-teams',
        slug: 'managing-people-teams',
      },
    ],
  },

  // Mock Udemy API response
  udemy: {
    results: [
      {
        id: 123456,
        title: 'Strategic Thinking and Planning',
        url: 'https://www.udemy.com/course/strategic-thinking/',
        price: '$84.99',
        headline: 'Learn strategic thinking frameworks',
        num_reviews: 1234,
        rating: 4.5,
      },
    ],
  },

  // Mock LinkedIn Learning API response
  linkedinLearning: {
    elements: [
      {
        urn: 'urn:li:lyndaCourse:12345',
        title: 'New Manager Foundations',
        url: 'https://www.linkedin.com/learning/new-manager-foundations',
        difficultyLevel: 'BEGINNER',
        timeToComplete: {
          duration: 7200,
          unit: 'SECOND',
        },
      },
    ],
  },
};

export const mockBenchmarkData = {
  'cross-role': {
    'Senior Engineer to Engineering Manager': {
      sampleSize: 145,
      averageTimelineMonths: 11,
      timelineRange: {
        min: 6,
        max: 18,
        p50: 10,
        p75: 13,
        p90: 16,
      },
      successRate: 75,
      commonChallenges: [
        'Transitioning from individual contributor mindset',
        'Developing people management skills',
        'Learning to delegate effectively',
      ],
      criticalSkills: ['People Management', 'Strategic Thinking', 'Stakeholder Management'],
    },
  },
  'cross-function': {
    'Marketing to Product Management': {
      sampleSize: 89,
      averageTimelineMonths: 14,
      timelineRange: {
        min: 10,
        max: 20,
        p50: 13,
        p75: 16,
        p90: 19,
      },
      successRate: 65,
      commonChallenges: [
        'Learning product development lifecycle',
        'Developing technical fluency',
        'Understanding engineering trade-offs',
      ],
      criticalSkills: ['Product Strategy', 'Technical Communication', 'Roadmap Planning'],
    },
  },
  'cross-industry': {
    'Teacher to Corporate Trainer': {
      sampleSize: 67,
      averageTimelineMonths: 8,
      timelineRange: {
        min: 4,
        max: 12,
        p50: 7,
        p75: 10,
        p90: 11,
      },
      successRate: 80,
      commonChallenges: [
        'Adapting to corporate culture',
        'Learning business context',
        'Understanding ROI measurement',
      ],
      criticalSkills: ['Adult Learning', 'Business Acumen', 'Training Technology'],
    },
  },
};

// Mock AI provider responses for transition analysis
export const mockAiResponses = {
  transitionTypeDetection: {
    engineerToManager: {
      transitionTypes: ['cross-role'],
      primaryTransitionType: 'cross-role',
      currentRole: 'Senior Software Engineer',
      targetRole: 'Engineering Manager',
      currentIndustry: 'Technology',
      targetIndustry: 'Technology',
      rationale: 'This is a cross-role transition within the same industry. The primary challenge is shifting from individual contributor to people management.',
      hybridTransition: false,
    },
    marketingToPM: {
      transitionTypes: ['cross-function'],
      primaryTransitionType: 'cross-function',
      currentRole: 'Marketing Manager',
      targetRole: 'Product Manager',
      currentIndustry: 'Technology',
      targetIndustry: 'Technology',
      rationale: 'This is a cross-function transition from marketing to product management within tech.',
      hybridTransition: false,
    },
    teacherToTrainer: {
      transitionTypes: ['cross-industry'],
      primaryTransitionType: 'cross-industry',
      currentRole: 'High School Teacher',
      targetRole: 'Corporate Trainer',
      currentIndustry: 'Education',
      targetIndustry: 'Technology',
      rationale: 'This is a cross-industry transition from education to corporate technology sector.',
      hybridTransition: false,
    },
    hybridTransition: {
      transitionTypes: ['cross-role', 'cross-industry'],
      primaryTransitionType: 'cross-industry',
      currentRole: 'Software Engineer',
      targetRole: 'Product Manager',
      currentIndustry: 'Technology',
      targetIndustry: 'Healthcare',
      rationale: 'This is a hybrid transition involving both role change and industry change. Industry change is the primary challenge due to healthcare domain complexity.',
      hybridTransition: true,
    },
  },

  roadmapGeneration: {
    engineerToManager: {
      timeline: {
        estimatedMonths: 10,
        minMonths: 8,
        maxMonths: 12,
        factors: [
          'Already has mentoring experience',
          'Needs people management skills',
          'Must develop business acumen',
        ],
      },
      milestones: [
        {
          title: 'Develop People Management Skills',
          description: 'Complete foundational management training and practice 1-on-1s',
          targetMonth: 3,
          effortHours: 40,
          status: 'pending',
        },
        {
          title: 'Build Strategic Thinking Capability',
          description: 'Learn to think beyond technical implementation',
          targetMonth: 6,
          effortHours: 30,
          status: 'pending',
        },
        {
          title: 'Understand Business Metrics',
          description: 'Learn key business metrics and how to track team impact',
          targetMonth: 8,
          effortHours: 25,
          status: 'pending',
        },
        {
          title: 'Gain Management Experience',
          description: 'Take on team lead or interim manager role',
          targetMonth: 10,
          effortHours: 160,
          status: 'pending',
        },
      ],
      bridgeRoles: ['Tech Lead', 'Senior Engineer II with team responsibilities'],
    },
  },

  careerCapitalAssessment: {
    engineerToManager: {
      uniqueSkills: [
        'Deep technical expertise in React, Node.js, TypeScript',
        'Cloud infrastructure knowledge (AWS, GCP)',
        'Mentoring experience',
        'Cross-functional collaboration',
      ],
      rareSkillCombinations: [
        'Technical depth + leadership experience',
        'Architecture design + people development',
      ],
      competitiveAdvantages: [
        'Can lead both technical and people discussions with credibility',
        'Understand engineering trade-offs from hands-on experience',
        'Bridge between technical and business stakeholders',
      ],
      recommendations: [
        'Leverage technical credibility to influence without authority',
        'Position yourself as technical leader who can also develop people',
        'Emphasize your ability to translate business needs into technical strategy',
      ],
    },
  },
};

// Helper function to generate test data
export const generateTestTransitionPlan = (overrides: Partial<typeof sampleTransitionPlans.crossRole> = {}) => {
  return {
    ...sampleTransitionPlans.crossRole,
    ...overrides,
  };
};

export const generateTestSkillGap = (overrides: Partial<typeof sampleSkillGaps.engineerToManager[0]> = {}) => {
  return {
    ...sampleSkillGaps.engineerToManager[0],
    ...overrides,
  };
};
