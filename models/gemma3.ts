/**
 * Gemma 1B via CactusCompute React Native SDK
 *
 * Uses on-device inference with the Cactus React Native SDK
 * Model runs locally on the device for privacy and offline capability
 *
 * IMPORTANT: Model is pre-initialized via ModelManager at app startup
 */

import { ModelManager } from './ModelManager';
import { buildPrompt } from './prompts';

export interface LocalModelResponse {
  success: boolean;
  response?: string;
  personality?: string;
  error?: string;
}

/**
 * Call Gemma 1B via CactusCompute native SDK with personality selection
 * @param userInput - The user's question or prompt
 * @returns Promise with the model's response
 */
export async function callGemma3(userInput: string): Promise<LocalModelResponse> {
  try {
    // Get pre-initialized model instance from ModelManager
    const lm = ModelManager.getGemmaInstance();

    const fullPrompt = buildPrompt(userInput);

    // Perform completion
    let responseText = '';
    await lm.complete({
      messages: [
        {
          role: 'user',
          content: fullPrompt
        }
      ],
      onToken: (token: string) => {
        responseText += token;
      }
    });

    // Extract personality if mentioned in response
    const personalityMatch = responseText.match(/(?:As|Channeling|From the perspective of)\s+([^,:.]+)/i);
    const personality = personalityMatch ? personalityMatch[1].trim() : undefined;

    return {
      success: true,
      response: responseText.trim(),
      personality
    };

  } catch (error) {
    return {
      success: false,
      error: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
