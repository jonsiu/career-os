import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Resume queries
export const getById = query({
  args: { id: v.id("resumes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("resumes")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("resumes")
      .withIndex("by_created_at", (q) => q.desc())
      .collect();
  },
});

// Resume mutations
export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    filePath: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const resumeId = await ctx.db.insert("resumes", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    return resumeId; // Return just the ID, not the full object
  },
});

export const update = mutation({
  args: {
    id: v.id("resumes"),
    updates: v.object({
      title: v.optional(v.string()),
      content: v.optional(v.string()),
      filePath: v.optional(v.string()),
      metadata: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const { id, updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("resumes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// AI-powered resume parsing action
export const parseResumeWithAI = action({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Check if Anthropic API key is available
      const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
      console.log('🔍 Convex: Checking Anthropic API key...');
      console.log('🔍 Convex: ANTHROPIC_API_KEY exists:', !!anthropicApiKey);
      console.log('🔍 Convex: ANTHROPIC_API_KEY length:', anthropicApiKey?.length || 0);
      
      if (!anthropicApiKey) {
        throw new Error('Anthropic API key not configured in Convex environment');
      }

      console.log('✅ Convex: Anthropic API key found, initializing Claude client...');
      const { Anthropic } = await import('@anthropic-ai/sdk');
      const anthropic = new Anthropic({
        apiKey: anthropicApiKey,
      });
      console.log('✅ Convex: Claude client initialized successfully');

      const prompt = `
        Parse this resume content and extract structured data. Return ONLY valid JSON in this exact format:
        
        {
          "personalInfo": {
            "firstName": "string",
            "lastName": "string", 
            "email": "string",
            "phone": "string",
            "location": "string",
            "summary": "string"
          },
          "experience": [
            {
              "title": "string",
              "company": "string",
              "location": "string", 
              "startDate": "string (YYYY-MM format)",
              "endDate": "string (YYYY-MM format or 'Present')",
              "current": "boolean",
              "description": "string"
            }
          ],
          "education": [
            {
              "degree": "string",
              "institution": "string",
              "location": "string",
              "startDate": "string (YYYY format)",
              "endDate": "string (YYYY format)",
              "current": "boolean",
              "gpa": "string (optional)",
              "description": "string"
            }
          ],
          "skills": [
            {
              "name": "string",
              "level": "beginner|intermediate|advanced|expert"
            }
          ],
          "projects": [
            {
              "name": "string",
              "description": "string",
              "technologies": ["string"],
              "url": "string (optional)",
              "startDate": "string (YYYY-MM format)",
              "endDate": "string (YYYY-MM format or 'Present')",
              "current": "boolean"
            }
          ]
        }
        
        RESUME CONTENT:
        ${args.content}
        
        IMPORTANT: 
        - Extract ALL experience entries with proper dates
        - Parse skills from comma-separated lists or bullet points
        - Convert dates to YYYY-MM format
        - Set current=true for "Present" dates
        - Be precise with company names and titles
        - Extract location from address or city/state info
        - Return ONLY the JSON, no other text
      `;

      // Try different Claude models in order of preference
      const models = ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"];
      let response;
      let lastError;

      for (const model of models) {
        try {
          console.log(`🤖 Convex: Trying Claude model ${model}...`);
          response = await anthropic.messages.create({
            model: model,
            max_tokens: 2000,
            temperature: 0.1,
            system: "You are an expert resume parser. Extract structured data with high accuracy. Return only valid JSON.",
            messages: [
              {
                role: "user",
                content: prompt
              }
            ]
          });
          console.log(`✅ Convex: Successfully used Claude model ${model}`);
          break; // Success, exit the loop
        } catch (error) {
          console.log(`❌ Convex: Claude model ${model} failed:`, error);
          lastError = error;
          continue; // Try next model
        }
      }

      if (!response) {
        throw new Error(`All Claude models failed. Last error: ${lastError}`);
      }

      const jsonResponse = response.content[0]?.text || '';
      console.log('✅ Convex: Received response from Claude');
      console.log('📄 Convex: Raw AI response length:', jsonResponse.length);
      
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ Convex: No valid JSON found in AI response');
        console.error('❌ Convex: Raw response:', jsonResponse);
        throw new Error('No valid JSON found in AI response');
      }

      console.log('🔍 Convex: Parsing JSON response...');
      const parsedData = JSON.parse(jsonMatch[0]);
      console.log('✅ Convex: JSON parsed successfully');
      
      // Validate and clean the data
      return {
        personalInfo: {
          firstName: parsedData.personalInfo?.firstName || '',
          lastName: parsedData.personalInfo?.lastName || '',
          email: parsedData.personalInfo?.email || '',
          phone: parsedData.personalInfo?.phone || '',
          location: parsedData.personalInfo?.location || '',
          summary: parsedData.personalInfo?.summary || '',
        },
        experience: parsedData.experience || [],
        education: parsedData.education || [],
        skills: parsedData.skills || [],
        projects: parsedData.projects || [],
      };
    } catch (error) {
      console.error('Claude resume parsing failed:', error);
      throw new Error(`Failed to parse resume with Claude: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});
