/**
 * API Endpoint: POST /api/skill-gap/explain-transfer
 *
 * Provides detailed explanation for how a specific skill transfers
 * between two contexts/roles using AI analysis.
 *
 * Task 2.3.2: explainTransfer method support
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';

const AI_TIMEOUT_MS = 30000; // 30 seconds

interface ExplainTransferRequest {
  skillName: string;
  currentContext: string;
  targetContext: string;
  prompt: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate request using Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: ExplainTransferRequest = await request.json();

    const { skillName, currentContext, targetContext, prompt } = body;

    // Validate inputs
    if (!skillName || !currentContext || !targetContext) {
      return NextResponse.json(
        {
          error: 'Invalid request: skillName, currentContext, and targetContext are required',
        },
        { status: 400 }
      );
    }

    // Initialize Anthropic client
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not configured');
      // Return fallback explanation
      return NextResponse.json({
        explanation: `${skillName} may transfer from ${currentContext} to ${targetContext} depending on how it was applied in your previous role.`,
        confidence: 0.5,
      });
    }

    const anthropic = new Anthropic({
      apiKey,
    });

    // Call Anthropic API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    try {
      const response = await anthropic.messages.create(
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          temperature: 0.3,
          system: 'You are a career transition expert explaining skill transferability.',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          signal: controller.signal as AbortSignal,
        }
      );

      clearTimeout(timeoutId);

      // Extract and parse response
      const aiResponseText =
        response.content[0]?.type === 'text' ? response.content[0].text : '';

      // Try to parse JSON from response
      let parsedResponse;
      try {
        // Look for JSON in code blocks or plain text
        const jsonMatch =
          aiResponseText.match(/```json\n?([\s\S]*?)\n?```/) ||
          aiResponseText.match(/\{[\s\S]*\}/);

        const jsonText = jsonMatch
          ? jsonMatch[1] || jsonMatch[0]
          : aiResponseText;
        parsedResponse = JSON.parse(jsonText);
      } catch (parseError) {
        // If not JSON, treat the entire response as explanation
        parsedResponse = {
          explanation: aiResponseText,
          confidence: 0.7,
        };
      }

      // Validate and normalize response
      const result = {
        explanation: parsedResponse.explanation || aiResponseText || 'No explanation available',
        confidence: typeof parsedResponse.confidence === 'number'
          ? Math.max(0, Math.min(1, parsedResponse.confidence))
          : 0.5,
      };

      return NextResponse.json(result);

    } catch (aiError: any) {
      clearTimeout(timeoutId);

      if (aiError.name === 'AbortError') {
        console.error('AI request timed out after 30 seconds');
        return NextResponse.json(
          { error: 'AI analysis timed out. Please try again.' },
          { status: 504 }
        );
      }

      console.error('Anthropic API error:', aiError);

      // Return fallback explanation on error
      return NextResponse.json({
        explanation: `${skillName} may transfer from ${currentContext} to ${targetContext} depending on how it was applied in your previous role.`,
        confidence: 0.5,
      });
    }

  } catch (error: any) {
    console.error('Explain transfer error:', error);

    // Return fallback explanation
    return NextResponse.json({
      explanation: 'Unable to generate explanation at this time.',
      confidence: 0.3,
    });
  }
}
