/**
 * Aurora Router Service
 * 
 * Uses Adaptive API for model selection when available.
 * Falls back to Claude Haiku as "router brain" when Adaptive is down.
 * Haiku analyzes the prompt and selects the best model from:
 * - SmolLM2 (local, fast, simple tasks)
 * - Qwen 3 (local, balanced)
 * - Claude Haiku 3.5 (cloud, fast, good quality)
 * - Claude Opus 4 (cloud, complex reasoning)
 */

const ANTHROPIC_BASE_URL = 'https://api.anthropic.com/v1';
const ADAPTIVE_BASE_URL = 'https://api.llmadaptive.uk/v1';

// API Keys
const ANTHROPIC_API_KEY = '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';
const ADAPTIVE_API_KEY = 'apk_LCFsg5NkMbWXjFSG7D4PeXXdpT3x2yNZeIMeLXll8Pk';

// Available models in our app
const AVAILABLE_MODELS = {
  'smollm2-360m': {
    id: 'smollm2-360m',
    displayName: 'SmolLM2',
    type: 'local',
    description: 'Fast local model for simple tasks',
  },
  'qwen3-0.6': {
    id: 'qwen3-0.6',
    displayName: 'Qwen 3',
    type: 'local',
    description: 'Balanced local model',
  },
  'claude-3-5-haiku': {
    id: 'claude-3-5-haiku',
    displayName: 'Haiku 3.5',
    type: 'cloud',
    fullModelName: 'claude-3-5-haiku-20241022',
    description: 'Fast cloud model with good quality',
  },
  'claude-opus-4': {
    id: 'claude-opus-4',
    displayName: 'Opus 4',
    type: 'cloud',
    fullModelName: 'claude-sonnet-4-20250514', // Using Sonnet as Opus proxy
    description: 'Best for complex reasoning and analysis',
  },
};

export interface RouterResult {
  selectedModel: string;
  modelId: string;
  displayName: string;
  reason: string;
  fullModelName: string;
  modelType: 'local' | 'cloud';
}

/**
 * Try Adaptive API first, fall back to Haiku as router brain.
 */
export async function selectModel(userPrompt: string): Promise<RouterResult> {
  console.log('Aurora Router: Analyzing prompt...', userPrompt.substring(0, 50));
  
  // Try Adaptive API first
  try {
    const adaptiveResult = await tryAdaptiveRouter(userPrompt);
    if (adaptiveResult) {
      console.log('Adaptive API success:', adaptiveResult.displayName);
      return adaptiveResult;
    }
  } catch (error) {
    console.log('Adaptive API unavailable, using Haiku as router brain');
  }
  
  // Fall back to Haiku as the router brain
  return await useHaikuAsRouter(userPrompt);
}

/**
 * Try the Adaptive API for model selection.
 */
async function tryAdaptiveRouter(userPrompt: string): Promise<RouterResult | null> {
  try {
    const response = await fetch(`${ADAPTIVE_BASE_URL}/select-model`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADAPTIVE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        models: [
          'anthropic/claude-opus-4-20250514',
          'anthropic/claude-3-5-haiku-20241022',
        ],
        prompt: userPrompt,
        cost_bias: 0.5,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const modelName = data.selected_model?.model_name || '';
    const isOpus = modelName.toLowerCase().includes('opus');
    
    return {
      selectedModel: isOpus ? 'opus' : 'haiku',
      modelId: isOpus ? 'claude-opus-4' : 'claude-3-5-haiku',
      displayName: isOpus ? 'Opus 4' : 'Haiku 3.5',
      reason: isOpus 
        ? '🧠 Complex Reasoning • Adaptive Router • Claude Opus 4'
        : '⚡ Speed Optimized • Adaptive Router • Claude Haiku 3.5',
      fullModelName: isOpus ? 'claude-sonnet-4-20250514' : 'claude-3-5-haiku-20241022',
      modelType: 'cloud',
    };
  } catch (error) {
    return null;
  }
}

/**
 * Use Claude Haiku as the "router brain" to select the best model.
 */
async function useHaikuAsRouter(userPrompt: string): Promise<RouterResult> {
  console.log('Using Haiku as router brain...');
  
  const routerPrompt = `You are Aurora Router, an AI model selector. Analyze this user prompt and select the BEST model based on DIFFICULTY LEVEL.

DIFFICULTY TIERS (be strict about these):

🟢 EASY (smollm2-360m) - Local, fastest:
- Basic math: 1+1, 2*3, simple arithmetic
- Single word answers: "What color is the sky?"
- Yes/no questions
- Very short factual lookups

🟡 EASY-MEDIUM (qwen3-0.6) - Local, balanced:
- Simple factual questions: capitals, dates, definitions
- Basic translations
- Short summaries
- Simple "how to" questions

🟠 MEDIUM-HARD (claude-3-5-haiku) - Cloud, quality:
- Coding help and debugging
- Creative writing (poems, stories)
- Detailed explanations of concepts
- Multi-step instructions
- Analysis of text or situations

🔴 HARD (claude-opus-4) - Cloud, premium:
- Complex scientific explanations (quantum physics, relativity, advanced math)
- Deep philosophical questions
- Multi-step reasoning problems
- Research-level questions
- Anything requiring expert-level knowledge
- Complex coding architecture
- Explaining equations or theorems

User prompt: "${userPrompt}"

Respond with ONLY a JSON object (no markdown, no explanation):
{"model": "model-id", "reason": "brief reason for selection"}

IMPORTANT: Scientific explanations (like Schrödinger's equation, quantum mechanics, relativity) are HARD - use claude-opus-4!`;

  try {
    const response = await fetch(`${ANTHROPIC_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        messages: [{ role: 'user', content: routerPrompt }],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error('Haiku router failed');
    }

    const data = await response.json();
    const responseText = data.content?.[0]?.text || '';
    console.log('Haiku router response:', responseText);
    
    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const selectedModelId = parsed.model;
      const reason = parsed.reason || 'Selected by Aurora Router';
      
      const modelConfig = AVAILABLE_MODELS[selectedModelId as keyof typeof AVAILABLE_MODELS];
      
      if (modelConfig) {
        const emoji = modelConfig.type === 'local' ? '📱' : (selectedModelId.includes('opus') ? '🧠' : '⚡');
        
        return {
          selectedModel: selectedModelId,
          modelId: selectedModelId,
          displayName: modelConfig.displayName,
          reason: `${emoji} ${reason} • ${modelConfig.displayName}`,
          fullModelName: modelConfig.type === 'cloud' 
            ? (modelConfig as any).fullModelName 
            : selectedModelId,
          modelType: modelConfig.type as 'local' | 'cloud',
        };
      }
    }
    
    // Default to Haiku if parsing fails
    throw new Error('Failed to parse router response');
  } catch (error) {
    console.error('Haiku router error:', error);
    // Default fallback to Haiku
    return {
      selectedModel: 'haiku',
      modelId: 'claude-3-5-haiku',
      displayName: 'Haiku 3.5',
      reason: '⚡ Default Selection • Claude Haiku 3.5',
      fullModelName: 'claude-3-5-haiku-20241022',
      modelType: 'cloud',
    };
  }
}

/**
 * Get completion from the appropriate model (cloud or local).
 * For cloud models, uses Anthropic API.
 * For local models, returns a flag to use CactusLM in the App.
 */
export async function streamCompletion(
  userPrompt: string,
  fullModelName: string,
  onToken: (token: string) => void,
  onComplete: () => void,
  modelType: 'local' | 'cloud' = 'cloud',
): Promise<string> {
  // For local models, we'll handle this differently in App.tsx
  if (modelType === 'local') {
    console.log('Local model selected - will use CactusLM:', fullModelName);
    // Return empty - App.tsx will handle local model inference
    onComplete();
    return '__USE_LOCAL_MODEL__';
  }
  
  console.log('Calling Anthropic with model:', fullModelName);

  try {
    const response = await fetch(`${ANTHROPIC_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: fullModelName,
        system: "Answer directly. Do not use <think> tags or thinking blocks. No internal reasoning - just respond.",
        messages: [
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      throw new Error(`Anthropic API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Anthropic response received');
    
    // Extract the text content from Anthropic's response format
    let fullResponse = data.content?.[0]?.text || '';
    
    // Remove <think> tags and their content (some models add thinking blocks)
    fullResponse = fullResponse.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    
    // Simulate streaming for nice UI animation
    const words = fullResponse.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i] + (i < words.length - 1 ? ' ' : '');
      onToken(word);
      // Small delay between words to simulate streaming effect
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    
    onComplete();
    return fullResponse;
  } catch (error) {
    console.error('Error calling Anthropic:', error);
    onComplete();
    throw error;
  }
}

export default {
  selectModel,
  streamCompletion,
  AVAILABLE_MODELS,
};
