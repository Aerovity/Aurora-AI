/**
 * Claude Haiku 4.5 API Integration
 */

import { ANTHROPIC_API_KEY, ANTHROPIC_BASE_URL, MODELS } from './config';
import { buildPrompt } from './prompts';

export interface ClaudeResponse {
  success: boolean;
  response?: string;
  personality?: string;
  error?: string;
}

/**
 * Call Claude Haiku 4.5 with personality selection
 * @param userInput - The user's question or prompt
 * @returns Promise with the model's response
 */
export async function callClaudeHaiku(userInput: string): Promise<ClaudeResponse> {
  try {
    if (!ANTHROPIC_API_KEY) {
      return {
        success: false,
        error: 'ANTHROPIC_API_KEY not configured. Please set it in your environment variables.'
      };
    }

    const fullPrompt = buildPrompt(userInput);

    const response = await fetch(`${ANTHROPIC_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODELS.CLAUDE_HAIKU_4_5,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: `API Error: ${response.status} - ${errorData.error?.message || response.statusText}`
      };
    }

    const data = await response.json();
    const responseText = data.content[0]?.text || '';

    // Extract personality if mentioned in response
    const personalityMatch = responseText.match(/(?:As|Channeling|From the perspective of)\s+([^,:.]+)/i);
    const personality = personalityMatch ? personalityMatch[1].trim() : undefined;

    return {
      success: true,
      response: responseText,
      personality
    };

  } catch (error) {
    return {
      success: false,
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
