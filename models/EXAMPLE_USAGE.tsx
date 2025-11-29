/**
 * Example: How to use the AI Models in your React Native App
 *
 * This file shows three different approaches:
 * 1. Using AppInitializer (Recommended - Easiest)
 * 2. Using useModelManager hook (More control)
 * 3. Manual initialization (Full control)
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AppInitializer, useModelManager, ModelManager } from './index';
import { callClaudeHaiku, callQwen3 } from './index';

// ============================================
// APPROACH 1: Using AppInitializer (Recommended)
// ============================================
// This is the EASIEST way - just wrap your app!

export function App() {
  return (
    <AppInitializer>
      <YourMainApp />
    </AppInitializer>
  );
}

function YourMainApp() {
  const [response, setResponse] = useState('');

  const handleAsk = async () => {
    // Models are already initialized! Just call them directly
    const result = await callClaudeHaiku('What is quantum physics?');
    if (result.success) {
      setResponse(result.response || '');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Ask Claude" onPress={handleAsk} />
      <Text>{response}</Text>
    </View>
  );
}

// ============================================
// APPROACH 2: Using useModelManager Hook
// ============================================
// For more control over initialization

export function AppWithHook() {
  const { isReady, qwenProgress, gemmaProgress, initialize } = useModelManager();
  const [response, setResponse] = useState('');

  useEffect(() => {
    // Initialize when component mounts
    initialize();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.container}>
        <Text>Downloading models...</Text>
        <Text>Qwen: {(qwenProgress * 100).toFixed(0)}%</Text>
        <Text>Gemma: {(gemmaProgress * 100).toFixed(0)}%</Text>
      </View>
    );
  }

  const handleAskLocal = async () => {
    const result = await callQwen3('Explain AI in simple terms');
    if (result.success) {
      setResponse(result.response || '');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Ask Qwen (Local)" onPress={handleAskLocal} />
      <Text>{response}</Text>
    </View>
  );
}

// ============================================
// APPROACH 3: Manual Initialization
// ============================================
// For complete control

export function AppManual() {
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState({ qwen: 0, gemma: 0 });

  useEffect(() => {
    initializeModels();

    // Cleanup on unmount
    return () => {
      ModelManager.cleanup();
    };
  }, []);

  const initializeModels = async () => {
    // Subscribe to progress updates
    const unsubscribe = ModelManager.subscribe((state) => {
      setProgress(state.downloadProgress);
      setIsReady(state.isInitialized);
    });

    try {
      await ModelManager.initializeModels();
    } catch (error) {
      console.error('Failed to initialize:', error);
    }

    return unsubscribe;
  };

  if (!isReady) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
        <Text>Qwen: {(progress.qwen * 100).toFixed(0)}%</Text>
        <Text>Gemma: {(progress.gemma * 100).toFixed(0)}%</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Models Ready!</Text>
    </View>
  );
}

// ============================================
// EXAMPLE: Using All Models
// ============================================

export function MultiModelExample() {
  const [responses, setResponses] = useState<Record<string, string>>({});

  const askAllModels = async (question: string) => {
    const { callClaudeHaiku, callClaudeOpus, callQwen3, callGemma3 } = await import('./index');

    // Ask all models in parallel
    const [haiku, opus, qwen, gemma] = await Promise.all([
      callClaudeHaiku(question),
      callClaudeOpus(question),
      callQwen3(question),
      callGemma3(question),
    ]);

    setResponses({
      haiku: haiku.response || 'Error',
      opus: opus.response || 'Error',
      qwen: qwen.response || 'Error',
      gemma: gemma.response || 'Error',
    });
  };

  return (
    <AppInitializer>
      <View style={styles.container}>
        <Button
          title="Ask All Models"
          onPress={() => askAllModels('What is consciousness?')}
        />
        <Text style={styles.modelTitle}>Claude Haiku:</Text>
        <Text>{responses.haiku}</Text>
        <Text style={styles.modelTitle}>Claude Opus:</Text>
        <Text>{responses.opus}</Text>
        <Text style={styles.modelTitle}>Qwen (Local):</Text>
        <Text>{responses.qwen}</Text>
        <Text style={styles.modelTitle}>Gemma (Local):</Text>
        <Text>{responses.gemma}</Text>
      </View>
    </AppInitializer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  modelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
});
