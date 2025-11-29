/**
 * Configuration for AI model APIs
 */

// Claude API key (required for Claude models)
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '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';

// Cactus token (OPTIONAL - only needed for telemetry or hybrid cloud fallback)
// Local models work perfectly fine WITHOUT this token!
export const CACTUS_TOKEN = process.env.CACTUS_TOKEN || '';

export const ANTHROPIC_BASE_URL = 'https://api.anthropic.com/v1';

// Model identifiers
export const MODELS = {
  CLAUDE_HAIKU_4_5: 'claude-3-5-haiku-20241022',
  CLAUDE_OPUS_4_5: 'claude-opus-4-20250514',
  QWEN_0_5B: 'qwen3-0.6', // Using Cactus native model (works offline, no API key needed)
  GEMMA_1B: 'gemma3-1b' // Using Cactus native model (works offline, no API key needed)
} as const;
