import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  G,
} from 'react-native-svg';
import type { Node, Edge, Message } from './types';
import NodeComponent from './NodeComponent';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MultiAgentWorkflowProps {
  nodes: Node[];
  edges: Edge[];
  messages: Message[];
}

interface EdgeComponentProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  isActivated: boolean;
  edgeId: string;
}

// Calculate actual path length for accurate animation
const calculatePathLength = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

const EdgeComponent: React.FC<EdgeComponentProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  progress,
  isActivated,
  edgeId,
}) => {
  const actualPathLength = calculatePathLength(fromX, fromY, toX, toY);
  const basePathLength = useSharedValue(actualPathLength);
  const gradientPathLength = useSharedValue(actualPathLength);

  // Animate base edge drawing on mount
  useEffect(() => {
    basePathLength.value = withTiming(0, {
      duration: 1000,
      easing: Easing.inOut(Easing.ease)
    });
  }, []);

  // Animate gradient based on progress or activation
  useEffect(() => {
    if (isActivated) {
      gradientPathLength.value = withTiming(0, { duration: 100 });
    } else if (progress > 0) {
      gradientPathLength.value = withTiming((1 - progress) * actualPathLength, { duration: 100 });
    } else {
      gradientPathLength.value = actualPathLength;
    }
  }, [progress, isActivated, actualPathLength]);

  const path = `M ${fromX} ${fromY} L ${toX} ${toY}`;
  const shouldShowGradient = progress > 0 || isActivated;

  const baseAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: basePathLength.value,
  }));

  const gradientAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: gradientPathLength.value,
  }));

  return (
    <G>
      <Defs>
        <LinearGradient id={`gradient-${edgeId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="rgba(42, 157, 91, 0.3)" />
          <Stop offset="50%" stopColor="rgba(111, 191, 76, 0.8)" />
          <Stop offset="100%" stopColor="rgba(42, 157, 91, 0.3)" />
        </LinearGradient>
      </Defs>

      {/* Base edge - always visible */}
      <AnimatedPath
        d={path}
        fill="none"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="2"
        strokeDasharray={`${actualPathLength} ${actualPathLength}`}
        animatedProps={baseAnimatedProps}
      />

      {/* Gradient overlay when message is active or activated */}
      {shouldShowGradient && (
        <AnimatedPath
          d={path}
          fill="none"
          stroke={`url(#gradient-${edgeId})`}
          strokeWidth="4"
          strokeDasharray={`${actualPathLength} ${actualPathLength}`}
          animatedProps={gradientAnimatedProps}
          opacity={1}
          style={{
            filter: 'drop-shadow(0 0 8px rgba(111, 191, 76, 0.6))',
          }}
        />
      )}
    </G>
  );
};

export const MultiAgentWorkflow: React.FC<MultiAgentWorkflowProps> = ({
  nodes,
  edges,
  messages,
}) => {
  // Track which edges have been activated (had a message complete)
  const [activatedEdges, setActivatedEdges] = useState<Set<string>>(new Set());

  // Update activated edges when messages complete
  useEffect(() => {
    messages.forEach((message) => {
      const edgeKey = `${message.from}-${message.to}`;
      if (message.progress >= 1 && !activatedEdges.has(edgeKey)) {
        setActivatedEdges((prev) => new Set(prev).add(edgeKey));
      }
    });
  }, [messages, activatedEdges]);

  return (
    <View style={styles.container}>
      {/* SVG layer for edges */}
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={styles.svgLayer}>
        {edges.map((edge) => {
          const fromNode = nodes.find((n) => n.id === edge.from);
          const toNode = nodes.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          // Find active message for this edge
          const activeMessage = messages.find(
            (m) => m.from === edge.from && m.to === edge.to
          );
          const edgeKey = `${edge.from}-${edge.to}`;
          const isActivated = activatedEdges.has(edgeKey);

          return (
            <EdgeComponent
              key={edge.id}
              fromX={fromNode.x}
              fromY={fromNode.y}
              toX={toNode.x}
              toY={toNode.y}
              progress={activeMessage?.progress || 0}
              isActivated={isActivated}
              edgeId={edge.id}
            />
          );
        })}
      </Svg>

      {/* Nodes layer - rendered on top of edges */}
      <View style={styles.nodesLayer}>
        {nodes.map((node) => (
          <NodeComponent key={node.id} node={node} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  svgLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  nodesLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});

export default MultiAgentWorkflow;
