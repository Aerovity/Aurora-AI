import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MultiAgentWorkflow from './MultiAgentWorkflow';
import type { Node, Edge, Message } from './types';

const { width, height } = Dimensions.get('window');

// Responsive positioning for phone screens (works on both iOS and Android)
// Layout: User -> Aurora -> 4 LLMs (vertically stacked on right)
const getNodePositions = () => {
  const containerHeight = 400;
  const centerX = width / 2;
  const centerY = containerHeight / 2;
  const horizontalSpread = width * 0.25; // Smaller spread to fit on screen
  const verticalSpread = containerHeight * 0.30; // Smaller vertical spread

  return {
    // User on the left
    userX: centerX - horizontalSpread,
    userY: centerY,

    // Aurora exactly at center (node.x is the center of the node)
    auroraX: centerX,
    auroraY: centerY,

    // 4 LLMs on the right, vertically stacked and centered
    llm1X: centerX + horizontalSpread,
    llm1Y: centerY - verticalSpread * 1.1,

    llm2X: centerX + horizontalSpread,
    llm2Y: centerY - verticalSpread * 0.37,

    llm3X: centerX + horizontalSpread,
    llm3Y: centerY + verticalSpread * 0.37,

    llm4X: centerX + horizontalSpread,
    llm4Y: centerY + verticalSpread * 1.1,
  };
};

interface SimpleWorkflowProps {
  onMessageSent?: boolean; // Trigger to send message
}

export const SimpleWorkflow: React.FC<SimpleWorkflowProps> = ({ onMessageSent }) => {
  const positions = getNodePositions();

  const [nodes, setNodes] = useState<Node[]>([
    {
      id: 'user',
      label: 'User',
      type: 'agent',
      x: positions.userX,
      y: positions.userY,
      state: 'idle',
    },
    {
      id: 'aurora',
      label: 'Aurora',
      type: 'agent',
      x: positions.auroraX,
      y: positions.auroraY,
      state: 'thinking', // Always thinking
    },
    {
      id: 'llm1',
      label: 'Gemma 3',
      type: 'llm',
      x: positions.llm1X,
      y: positions.llm1Y,
      state: 'idle',
    },
    {
      id: 'llm2',
      label: 'Haiku 4.5',
      type: 'llm',
      x: positions.llm2X,
      y: positions.llm2Y,
      state: 'idle',
    },
    {
      id: 'llm3',
      label: 'Opus 4.5',
      type: 'llm',
      x: positions.llm3X,
      y: positions.llm3Y,
      state: 'idle',
    },
    {
      id: 'llm4',
      label: 'Qwen 3',
      type: 'llm',
      x: positions.llm4X,
      y: positions.llm4Y,
      state: 'idle',
    },
  ]);

  const edges: Edge[] = [
    { id: 'e1', from: 'user', to: 'aurora' },
    { id: 'e2', from: 'aurora', to: 'llm1' },
    { id: 'e3', from: 'aurora', to: 'llm2' },
    { id: 'e4', from: 'aurora', to: 'llm3' },
    { id: 'e5', from: 'aurora', to: 'llm4' },
  ];

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageIdCounter, setMessageIdCounter] = useState(0);

  // Auto-send message when onMessageSent prop changes
  useEffect(() => {
    if (onMessageSent) {
      sendMessage('user', 'aurora');
    }
  }, [onMessageSent]);

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

    // Animate progress from 0 to 1 over 1.5 seconds
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.02; // Increment by 2%
      if (progress >= 1) {
        clearInterval(interval);
        // Remove message when complete (edge will stay lit)
        setMessages((prev) => prev.filter((m) => m.id !== newMessageId));
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === newMessageId ? { ...m, progress } : m))
        );
      }
    }, 30); // Update every 30ms (total: 50 steps × 30ms = 1500ms)
  };

  return (
    <View style={styles.container}>
      <MultiAgentWorkflow nodes={nodes} edges={edges} messages={messages} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 400, // Increased height for 6 nodes
    backgroundColor: 'transparent', // Changed from black to transparent
  },
});

export default SimpleWorkflow;
