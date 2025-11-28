import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MultiAgentWorkflow from './MultiAgentWorkflow';
import type { Node, Message } from './types';

export default function ExampleUsage() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'user', label: 'User', type: 'agent', x: 200, y: 300, state: 'idle' },
    { id: 'coordinator', label: 'Aurora', type: 'agent', x: 400, y: 300, state: 'idle' },
    { id: 'llm1', label: 'Gemma 3', type: 'llm', x: 650, y: 150, state: 'idle' },
    { id: 'llm2', label: 'Haiku 4.5', type: 'llm', x: 650, y: 250, state: 'idle' },
    { id: 'llm3', label: 'Opus 4.5', type: 'llm', x: 650, y: 350, state: 'idle' },
    { id: 'llm4', label: 'Qwen 3', type: 'llm', x: 650, y: 450, state: 'idle' },
  ]);

  const edges = [
    { id: 'e1', from: 'user', to: 'coordinator' },
    { id: 'e2', from: 'coordinator', to: 'llm1' },
    { id: 'e3', from: 'coordinator', to: 'llm2' },
    { id: 'e4', from: 'coordinator', to: 'llm3' },
    { id: 'e5', from: 'coordinator', to: 'llm4' },
  ];

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageIdCounter, setMessageIdCounter] = useState(0);

  const sendMessage = (from: string, to: string) => {
    const newMessageId = `msg-${messageIdCounter}`;
    setMessageIdCounter((prev) => prev + 1);

    const newMessage: Message = {
      id: newMessageId,
      from,
      to,
      progress: 0,
    };

    setMessages((prev) => [...prev, newMessage]);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.02;
      if (progress >= 1) {
        clearInterval(interval);
        setMessages((prev) => prev.filter((m) => m.id !== newMessageId));
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === newMessageId ? { ...m, progress } : m))
        );
      }
    }, 30);
  };

  const toggleThinking = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId ? { ...n, state: n.state === 'thinking' ? 'idle' : 'thinking' } : n
      )
    );
  };

  const runDemo = () => {
    // Reset states
    setNodes((prev) => prev.map((n) => ({ ...n, state: 'idle' })));
    setMessages([]);

    // Step 1: User sends request to Aurora
    setTimeout(() => sendMessage('user', 'coordinator'), 500);

    // Step 2: Aurora receives and starts thinking
    setTimeout(() => toggleThinking('coordinator'), 1500);

    // Step 3: Aurora finishes thinking and sends to all 4 LLMs
    setTimeout(() => toggleThinking('coordinator'), 3000);
    setTimeout(() => sendMessage('coordinator', 'llm1'), 3000);
    setTimeout(() => sendMessage('coordinator', 'llm2'), 3100);
    setTimeout(() => sendMessage('coordinator', 'llm3'), 3200);
    setTimeout(() => sendMessage('coordinator', 'llm4'), 3300);

    // Step 4: All LLMs start thinking
    setTimeout(() => toggleThinking('llm1'), 4000);
    setTimeout(() => toggleThinking('llm2'), 4100);
    setTimeout(() => toggleThinking('llm3'), 4200);
    setTimeout(() => toggleThinking('llm4'), 4300);

    // Step 5: LLMs finish thinking at different times
    setTimeout(() => toggleThinking('llm1'), 6000);
    setTimeout(() => toggleThinking('llm2'), 6500);
    setTimeout(() => toggleThinking('llm3'), 7000);
    setTimeout(() => toggleThinking('llm4'), 7500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <MultiAgentWorkflow nodes={nodes} edges={edges} messages={messages} />

      <View style={styles.controlsContainer}>
        <View style={styles.controlsPanel}>
          <Text style={styles.controlsTitle}>Animation Controls</Text>

          <TouchableOpacity style={styles.demoButton} onPress={runDemo}>
            <Text style={styles.demoButtonText}>Run Demo</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Send Messages:</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => sendMessage('user', 'coordinator')}
            >
              <Text style={styles.buttonText}>User → Aurora</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => sendMessage('coordinator', 'llm1')}
            >
              <Text style={styles.buttonText}>Aurora → Gemma 3</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => sendMessage('coordinator', 'llm2')}
            >
              <Text style={styles.buttonText}>Aurora → Haiku 4.5</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Toggle Thinking:</Text>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => toggleThinking('coordinator')}
              >
                <Text style={styles.buttonText}>Aurora</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => toggleThinking('llm1')}>
                <Text style={styles.buttonText}>Gemma 3</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => toggleThinking('llm2')}>
                <Text style={styles.buttonText}>Haiku 4.5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => toggleThinking('llm3')}>
                <Text style={styles.buttonText}>Opus 4.5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => toggleThinking('llm4')}>
                <Text style={styles.buttonText}>Qwen 3</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    maxHeight: '60%',
  },
  controlsPanel: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  controlsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  demoButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 12,
  },
  sectionTitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 8,
  },
  buttonGroup: {
    gap: 4,
  },
  button: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 200,
  },
});
