/**
 * AppInitializer Component
 *
 * Handles automatic initialization and cleanup of models
 * - Initializes models when app starts
 * - Unloads models when app closes/backgrounds
 * - Shows loading screen during initialization
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, AppState, AppStateStatus } from 'react-native';
import { ModelManager } from './ModelManager';
import { useModelManager } from './useModelManager';

interface AppInitializerProps {
  children: React.ReactNode;
  LoadingComponent?: React.ComponentType<{ qwenProgress: number; gemmaProgress: number }>;
}

/**
 * Wrap your app with this component to handle model lifecycle
 *
 * @example
 * ```tsx
 * export default function App() {
 *   return (
 *     <AppInitializer>
 *       <YourApp />
 *     </AppInitializer>
 *   );
 * }
 * ```
 */
export function AppInitializer({ children, LoadingComponent }: AppInitializerProps) {
  const { state, initialize, cleanup, qwenProgress, gemmaProgress } = useModelManager();

  useEffect(() => {
    // Initialize models on app start
    initialize();

    // Listen to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup on unmount (app close)
    return () => {
      subscription.remove();
      cleanup();
      console.log('[AppInitializer] App closed, models unloaded');
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App is going to background or closing
      cleanup();
      console.log('[AppInitializer] App backgrounded, models unloaded');
    } else if (nextAppState === 'active' && !state.isInitialized) {
      // App came back to foreground, re-initialize if needed
      initialize();
      console.log('[AppInitializer] App resumed, reinitializing models');
    }
  };

  // Show loading screen while initializing
  if (!state.isInitialized) {
    if (LoadingComponent) {
      return <LoadingComponent qwenProgress={qwenProgress} gemmaProgress={gemmaProgress} />;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading AI Models...</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.modelName}>Qwen 0.5B</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${qwenProgress * 100}%` }]} />
          </View>
          <Text style={styles.percentage}>{(qwenProgress * 100).toFixed(0)}%</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.modelName}>Gemma 1B</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${gemmaProgress * 100}%` }]} />
          </View>
          <Text style={styles.percentage}>{(gemmaProgress * 100).toFixed(0)}%</Text>
        </View>
        {state.error && <Text style={styles.error}>Error: {state.error}</Text>}
      </View>
    );
  }

  // Models loaded, show app
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 40,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 30,
  },
  modelName: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'right',
  },
  error: {
    color: '#ff4444',
    marginTop: 20,
    fontSize: 14,
  },
});
