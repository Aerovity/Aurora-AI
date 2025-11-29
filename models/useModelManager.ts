/**
 * React Hook for ModelManager
 *
 * Provides easy integration of ModelManager into React Native components
 * Handles initialization, progress tracking, and state management
 */

import { useEffect, useState } from 'react';
import { ModelManager, ModelManagerState } from './ModelManager';

/**
 * Hook to use ModelManager in React components
 *
 * @param autoInitialize - Whether to automatically initialize models on mount (default: false)
 * @returns ModelManager state and control functions
 *
 * @example
 * ```tsx
 * function App() {
 *   const { state, initialize } = useModelManager();
 *
 *   useEffect(() => {
 *     initialize();
 *   }, []);
 *
 *   if (!state.isInitialized) {
 *     return <LoadingScreen progress={state.downloadProgress} />;
 *   }
 *
 *   return <MainApp />;
 * }
 * ```
 */
export function useModelManager(autoInitialize: boolean = false) {
  const [state, setState] = useState<ModelManagerState>(ModelManager.getState());
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    // Subscribe to ModelManager state changes
    const unsubscribe = ModelManager.subscribe((newState) => {
      setState(newState);
    });

    // Auto-initialize if requested
    if (autoInitialize && !state.isInitialized && !isInitializing) {
      initialize();
    }

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [autoInitialize]);

  /**
   * Initialize models manually
   */
  const initialize = async () => {
    if (isInitializing || state.isInitialized) {
      return;
    }

    setIsInitializing(true);
    try {
      await ModelManager.initializeModels();
    } catch (error) {
      console.error('[useModelManager] Initialization failed:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  /**
   * Cleanup models (useful for testing or memory management)
   */
  const cleanup = () => {
    ModelManager.cleanup();
  };

  return {
    state,
    isInitializing,
    initialize,
    cleanup,
    // Convenience flags
    isReady: state.isInitialized,
    qwenProgress: state.downloadProgress.qwen,
    gemmaProgress: state.downloadProgress.gemma,
    overallProgress: (state.downloadProgress.qwen + state.downloadProgress.gemma) / 2,
  };
}
