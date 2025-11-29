/**
 * Model API Functions - Main Export
 *
 * This module provides access to multiple AI models:
 * - Claude Haiku 4.5 (Anthropic)
 * - Claude Opus 4.5 (Anthropic)
 * - Qwen 0.5B (via CactusCompute)
 * - Gemma 1B (via CactusCompute)
 */

// Model functions
export { callClaudeHaiku } from './claudeHaiku';
export { callClaudeOpus } from './claudeOpus';
export { callQwen3 } from './qwen3';
export { callGemma3 } from './gemma3';

// Model Manager (for initialization)
export { ModelManager } from './ModelManager';

// React Hook
export { useModelManager } from './useModelManager';

// App Initializer Component
export { AppInitializer } from './AppInitializer';

// Types
export type { ClaudeResponse } from './claudeHaiku';
export type { LocalModelResponse } from './qwen3';
export type { ModelManagerState, ModelDownloadProgress } from './ModelManager';
