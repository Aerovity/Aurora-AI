/**
 * ModelManager - Centralized model initialization and management
 *
 * This manager handles:
 * - Pre-downloading models at app startup
 * - Progress tracking for downloads
 * - Caching model instances
 * - Reusing instances across function calls
 */

import { CactusLM, CactusConfig } from 'cactus-react-native';
import { CACTUS_TOKEN, MODELS } from './config';

export interface ModelDownloadProgress {
  qwen: number;
  gemma: number;
}

export interface ModelManagerState {
  isInitialized: boolean;
  downloadProgress: ModelDownloadProgress;
  error?: string;
}

class ModelManagerClass {
  private qwenInstance: CactusLM | null = null;
  private gemmaInstance: CactusLM | null = null;
  private state: ModelManagerState = {
    isInitialized: false,
    downloadProgress: {
      qwen: 0,
      gemma: 0
    }
  };
  private listeners: Array<(state: ModelManagerState) => void> = [];

  constructor() {
    // Initialize Cactus configuration (OPTIONAL - only for telemetry/hybrid mode)
    // Local models work fine without this!
    if (CACTUS_TOKEN) {
      CactusConfig.cactusToken = CACTUS_TOKEN;
    }
  }

  /**
   * Initialize and download all local models at app startup
   * This should be called once when the app loads
   */
  async initializeModels(): Promise<void> {
    try {
      console.log('[ModelManager] Starting model initialization...');

      // Initialize Qwen model
      await this.initializeQwen();

      // Initialize Gemma model
      await this.initializeGemma();

      this.state.isInitialized = true;
      this.notifyListeners();

      console.log('[ModelManager] All models initialized successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.state.error = errorMessage;
      this.notifyListeners();
      console.error('[ModelManager] Initialization error:', errorMessage);
      throw error;
    }
  }

  /**
   * Initialize Qwen model with download progress
   */
  private async initializeQwen(): Promise<void> {
    console.log('[ModelManager] Initializing Qwen 0.5B...');

    this.qwenInstance = new CactusLM({
      model: MODELS.QWEN_0_5B,
      contextSize: 2048
    });

    // Download with progress tracking
    await this.qwenInstance.download((progress) => {
      this.state.downloadProgress.qwen = progress;
      this.notifyListeners();
      console.log(`[ModelManager] Qwen download progress: ${(progress * 100).toFixed(1)}%`);
    });

    console.log('[ModelManager] Qwen 0.5B ready!');
  }

  /**
   * Initialize Gemma model with download progress
   */
  private async initializeGemma(): Promise<void> {
    console.log('[ModelManager] Initializing Gemma 1B...');

    this.gemmaInstance = new CactusLM({
      model: MODELS.GEMMA_1B,
      contextSize: 2048
    });

    // Download with progress tracking
    await this.gemmaInstance.download((progress) => {
      this.state.downloadProgress.gemma = progress;
      this.notifyListeners();
      console.log(`[ModelManager] Gemma download progress: ${(progress * 100).toFixed(1)}%`);
    });

    console.log('[ModelManager] Gemma 1B ready!');
  }

  /**
   * Get Qwen model instance (must call initializeModels first)
   */
  getQwenInstance(): CactusLM {
    if (!this.qwenInstance) {
      throw new Error('Qwen model not initialized. Call ModelManager.initializeModels() first.');
    }
    return this.qwenInstance;
  }

  /**
   * Get Gemma model instance (must call initializeModels first)
   */
  getGemmaInstance(): CactusLM {
    if (!this.gemmaInstance) {
      throw new Error('Gemma model not initialized. Call ModelManager.initializeModels() first.');
    }
    return this.gemmaInstance;
  }

  /**
   * Get current state of model manager
   */
  getState(): ModelManagerState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes (useful for React components)
   */
  subscribe(listener: (state: ModelManagerState) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  /**
   * Clean up resources (call on app shutdown)
   */
  cleanup(): void {
    try {
      if (this.qwenInstance) {
        this.qwenInstance.destroy();
        this.qwenInstance = null;
      }
      if (this.gemmaInstance) {
        this.gemmaInstance.destroy();
        this.gemmaInstance = null;
      }
      this.state.isInitialized = false;
      console.log('[ModelManager] Cleanup complete');
    } catch (error) {
      console.error('[ModelManager] Cleanup error:', error);
    }
  }
}

// Export singleton instance
export const ModelManager = new ModelManagerClass();
