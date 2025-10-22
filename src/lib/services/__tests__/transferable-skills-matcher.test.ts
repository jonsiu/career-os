import { TransferableSkillsMatcher } from '../transferable-skills-matcher';
import { ONetSkill } from '@/lib/abstractions/types';

// Mock the Anthropic API
global.fetch = jest.fn();

describe('TransferableSkillsMatcher', () => {
  let matcher: TransferableSkillsMatcher;

  beforeEach(() => {
    matcher = new TransferableSkillsMatcher();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('AI prompt construction', () => {
    it('should construct valid AI prompt with resume and target skills', async () => {
      const currentSkills = [
        { name: 'JavaScript', level: 'intermediate' },
        { name: 'React', level: 'advanced' },
        { name: 'Project Management', level: 'beginner' },
      ];

      const targetSkills: ONetSkill[] = [
        {
          skillName: 'TypeScript',
          skillCode: '2.B.5.a',
          importance: 90,
          level: 71,
          category: 'Technical Skills',
        },
        {
          skillName: 'Leadership',
          skillCode: '2.C.1.a',
          importance: 85,
          level: 71,
          category: 'Soft Skills',
        },
      ];

      const currentRole = 'Frontend Developer';
      const targetRole = 'Engineering Manager';

      // Mock successful AI response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          transferableSkills: [
            {
              skillName: 'Project Management',
              currentLevel: 30,
              applicabilityToTarget: 85,
              transferRationale: 'Project management experience translates directly to engineering management responsibilities',
              confidence: 0.9,
            },
          ],
          transferPatterns: ['Domain knowledge transfer'],
        }),
      });

      const result = await matcher.findTransferableSkills(
        currentSkills,
        targetSkills,
        currentRole,
        targetRole
      );

      // Verify fetch was called with correct structure
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/skill-gap/transferable-skills',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Frontend Developer'),
        })
      );

      expect(result).toBeDefined();
      expect(result.transferableSkills).toHaveLength(1);
    });
  });

  describe('response parsing and validation', () => {
    it('should parse and validate AI response correctly', async () => {
      const currentSkills = [{ name: 'Python', level: 'advanced' }];
      const targetSkills: ONetSkill[] = [
        {
          skillName: 'Data Analysis',
          skillCode: '2.B.4.a',
          importance: 80,
          level: 71,
          category: 'Technical Skills',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          transferableSkills: [
            {
              skillName: 'Python',
              currentLevel: 85,
              applicabilityToTarget: 90,
              transferRationale: 'Python is widely used in data analysis',
              confidence: 0.95,
            },
          ],
          transferPatterns: ['Direct skill overlap'],
        }),
      });

      const result = await matcher.findTransferableSkills(
        currentSkills,
        targetSkills,
        'Software Engineer',
        'Data Scientist'
      );

      expect(result.transferableSkills).toBeDefined();
      expect(result.transferableSkills[0]).toHaveProperty('skillName');
      expect(result.transferableSkills[0]).toHaveProperty('currentLevel');
      expect(result.transferableSkills[0]).toHaveProperty('applicabilityToTarget');
      expect(result.transferableSkills[0]).toHaveProperty('transferRationale');
      expect(result.transferableSkills[0]).toHaveProperty('confidence');
      expect(result.transferableSkills[0].confidence).toBeGreaterThanOrEqual(0);
      expect(result.transferableSkills[0].confidence).toBeLessThanOrEqual(1);
    });

    it('should handle malformed AI responses gracefully', async () => {
      const currentSkills = [{ name: 'Java', level: 'intermediate' }];
      const targetSkills: ONetSkill[] = [];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          // Missing transferableSkills array
          transferPatterns: [],
        }),
      });

      const result = await matcher.findTransferableSkills(
        currentSkills,
        targetSkills,
        'Backend Developer',
        'Full Stack Developer'
      );

      // Should return empty or fallback to O*NET baseline
      expect(result).toBeDefined();
      expect(Array.isArray(result.transferableSkills)).toBe(true);
    });
  });

  describe('confidence scoring (0-1 scale)', () => {
    it('should calculate confidence scores between 0 and 1', async () => {
      const currentSkills = [{ name: 'Teaching', level: 'advanced' }];
      const targetSkills: ONetSkill[] = [
        {
          skillName: 'Leadership',
          skillCode: '2.C.1.a',
          importance: 90,
          level: 71,
          category: 'Soft Skills',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          transferableSkills: [
            {
              skillName: 'Teaching',
              currentLevel: 85,
              applicabilityToTarget: 75,
              transferRationale: 'Teaching involves classroom management which translates to leadership',
              confidence: 0.75,
            },
          ],
          transferPatterns: ['Meta-skills transfer'],
        }),
      });

      const result = await matcher.findTransferableSkills(
        currentSkills,
        targetSkills,
        'Teacher',
        'Team Lead'
      );

      expect(result.transferableSkills[0].confidence).toBeGreaterThanOrEqual(0);
      expect(result.transferableSkills[0].confidence).toBeLessThanOrEqual(1);
      expect(result.transferableSkills[0].confidence).toBe(0.75);
    });

    it('should use calculateTransferConfidence for custom scoring', () => {
      const skill = {
        name: 'Communication',
        level: 'advanced',
      };

      const explanation = 'Strong communication skills are essential in all roles';

      const targetSkill: ONetSkill = {
        skillName: 'Public Speaking',
        skillCode: '2.A.1.a',
        importance: 80,
        level: 71,
        category: 'Basic Skills',
      };

      const confidence = matcher.calculateTransferConfidence(skill, explanation, targetSkill);

      expect(confidence).toBeGreaterThanOrEqual(0);
      expect(confidence).toBeLessThanOrEqual(1);
      expect(typeof confidence).toBe('number');
    });
  });

  describe('fallback to O*NET baseline if AI fails', () => {
    it('should fall back to O*NET baseline when AI times out', async () => {
      const currentSkills = [{ name: 'JavaScript', level: 'advanced' }];
      const targetSkills: ONetSkill[] = [
        {
          skillName: 'JavaScript',
          skillCode: '2.B.5.a',
          importance: 90,
          level: 71,
          category: 'Technical Skills',
        },
      ];

      // Mock timeout
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Request timeout'));

      const result = await matcher.findTransferableSkills(
        currentSkills,
        targetSkills,
        'Frontend Developer',
        'Full Stack Developer'
      );

      // Should still return results from O*NET baseline
      expect(result).toBeDefined();
      expect(result.transferableSkills).toBeDefined();
      expect(Array.isArray(result.transferableSkills)).toBe(true);
    });

    it('should find exact skill matches in O*NET baseline', async () => {
      const currentSkills = [
        { name: 'Critical Thinking', level: 'advanced' },
        { name: 'Problem Solving', level: 'intermediate' },
      ];

      const targetSkills: ONetSkill[] = [
        {
          skillName: 'Critical Thinking',
          skillCode: '2.A.2.a',
          importance: 85,
          level: 71,
          category: 'Basic Skills',
        },
        {
          skillName: 'Complex Problem Solving',
          skillCode: '2.A.2.b',
          importance: 85,
          level: 71,
          category: 'Basic Skills',
        },
      ];

      // Force use of baseline by mocking AI failure
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('AI service unavailable'));

      const result = await matcher.findTransferableSkills(
        currentSkills,
        targetSkills,
        'Analyst',
        'Senior Analyst'
      );

      // Should find exact match for "Critical Thinking"
      const criticalThinkingMatch = result.transferableSkills.find(
        (s: any) => s.skillName.toLowerCase().includes('critical thinking')
      );

      expect(criticalThinkingMatch).toBeDefined();
      expect(criticalThinkingMatch?.confidence).toBeGreaterThan(0.5); // High confidence for exact match
    });
  });

  describe('explainTransfer method', () => {
    it('should generate transfer explanation for specific skills', async () => {
      const skillName = 'Project Management';
      const currentContext = 'Frontend Development';
      const targetContext = 'Engineering Management';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          explanation: 'Project management in frontend development involves coordinating with designers, backend teams, and stakeholders, which directly translates to engineering management.',
          confidence: 0.85,
        }),
      });

      const result = await matcher.explainTransfer(skillName, currentContext, targetContext);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
