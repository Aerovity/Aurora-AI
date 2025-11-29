import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Animated, Easing } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Tree layout positions
const NODE_RADIUS = 35;
const VERTICAL_SPACING = 100; // Space between levels

// User at top
const USER_Y = SCREEN_HEIGHT / 2 - VERTICAL_SPACING - 60;
const USER_NODE = {
  x: SCREEN_WIDTH / 2,
  y: USER_Y,
};

// Aurora in middle
const AURORA_Y = USER_Y + VERTICAL_SPACING;
const AURORA_NODE = {
  x: SCREEN_WIDTH / 2,
  y: AURORA_Y,
};

// Models at bottom in a row
const MODELS_Y = AURORA_Y + VERTICAL_SPACING;
const MODEL_SPACING = 75; // Horizontal spacing between models

// Model configurations - Claude + Local models
const MODELS = [
  { id: 'smollm2-360m', label: 'SmolLM2', icon: require('../assets/lucidicons/huggingface.png') },
  { id: 'claude-3-5-haiku', label: 'Haiku 3.5', icon: require('../assets/lucidicons/claudehaiku.png') },
  { id: 'claude-opus-4', label: 'Opus 4', icon: require('../assets/lucidicons/claude.png') },
  { id: 'qwen3-0.6', label: 'Qwen 3', icon: require('../assets/lucidicons/qwen.png') },
];

// Calculate model positions in a row (centered)
const getModelPositions = () => {
  const totalWidth = (MODELS.length - 1) * MODEL_SPACING;
  const startX = SCREEN_WIDTH / 2 - totalWidth / 2;
  
  return MODELS.map((_, index) => ({
    x: startX + index * MODEL_SPACING,
    y: MODELS_Y,
  }));
};

interface AuroraWorkflowProps {
  visible: boolean;
  phase: 'idle' | 'aurora-thinking' | 'routing' | 'model-thinking' | 'complete';
  selectedModelId?: string;
  onComplete?: () => void;
}

// User Icon Component (simple circle with user silhouette)
const UserIcon: React.FC = () => (
  <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: 'rgba(167, 243, 208, 0.8)',
      marginBottom: 2,
    }} />
    <View style={{
      width: 20,
      height: 10,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      backgroundColor: 'rgba(167, 243, 208, 0.8)',
    }} />
  </View>
);

// Thinking Node Component
const ThinkingNode: React.FC<{
  x: number;
  y: number;
  icon?: any;
  label: string;
  isThinking: boolean;
  isAurora?: boolean;
  isUser?: boolean;
}> = ({ x, y, icon, label, isThinking, isAurora, isUser }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const rotationLoop = useRef<Animated.CompositeAnimation | null>(null);
  const glowLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // Entry animation
    Animated.timing(scale, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isThinking) {
      // Rotation animation
      rotation.setValue(0);
      rotationLoop.current = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotationLoop.current.start();

      // Glow animation
      glowLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      glowLoop.current.start();
    } else {
      rotationLoop.current?.stop();
      glowLoop.current?.stop();
      Animated.timing(rotation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      rotationLoop.current?.stop();
      glowLoop.current?.stop();
    };
  }, [isThinking]);

  const rotateInterpolation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.nodeContainer,
        {
          left: x - NODE_RADIUS,
          top: y - NODE_RADIUS,
          width: NODE_RADIUS * 2,
          height: NODE_RADIUS * 2,
          transform: [{ scale }],
        },
      ]}
    >
      {/* Glow effect */}
      {isThinking && (
        <Animated.View style={[styles.nodeGlow, { opacity: glowOpacity }]} />
      )}

      {/* Rotating gradient border when thinking */}
      {isThinking && (
        <Animated.View style={[styles.gradientBorder, { transform: [{ rotate: rotateInterpolation }] }]}>
          <ExpoLinearGradient
            colors={['#C8DC3C', '#6FBF4C', '#2A9D5B', '#176B58', '#C8DC3C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />
        </Animated.View>
      )}

      {/* Node background */}
      <View style={[styles.nodeInner, !isThinking && styles.nodeInnerIdle]}>
        {isUser ? (
          <UserIcon />
        ) : (
          <Image source={icon} style={styles.nodeIcon} resizeMode="contain" />
        )}
      </View>

      {/* Label */}
      <View style={styles.nodeLabelContainer}>
        <Text style={styles.nodeLabel}>{label}</Text>
      </View>
    </Animated.View>
  );
};

// Simple Edge Component (without animation for now)
const SimpleEdge: React.FC<{
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  isActive: boolean;
  edgeId: string;
}> = ({ fromX, fromY, toX, toY, isActive, edgeId }) => {
  // Calculate angle for arrow offset
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  
  const startX = fromX + Math.cos(angle) * NODE_RADIUS;
  const startY = fromY + Math.sin(angle) * NODE_RADIUS;
  const endX = toX - Math.cos(angle) * NODE_RADIUS;
  const endY = toY - Math.sin(angle) * NODE_RADIUS;

  const path = `M ${startX} ${startY} L ${endX} ${endY}`;

  return (
    <G>
      <Defs>
        <LinearGradient id={`edge-gradient-${edgeId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="rgba(42, 157, 91, 0.3)" />
          <Stop offset="50%" stopColor="rgba(111, 191, 76, 0.9)" />
          <Stop offset="100%" stopColor="rgba(42, 157, 91, 0.3)" />
        </LinearGradient>
      </Defs>
      
      {/* Base edge */}
      <Path
        d={path}
        fill="none"
        stroke={isActive ? "rgba(111, 191, 76, 0.8)" : "rgba(255, 255, 255, 0.15)"}
        strokeWidth={isActive ? 3 : 2}
      />
    </G>
  );
};

export const AuroraWorkflow: React.FC<AuroraWorkflowProps> = ({
  visible,
  phase,
  selectedModelId,
  onComplete,
}) => {
  const containerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const modelPositions = getModelPositions();

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {/* SVG Layer for edges */}
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={styles.svgLayer}>
        {/* Edge from User to Aurora */}
        <SimpleEdge
          fromX={USER_NODE.x}
          fromY={USER_NODE.y}
          toX={AURORA_NODE.x}
          toY={AURORA_NODE.y}
          isActive={phase === 'aurora-thinking' || phase === 'routing' || phase === 'model-thinking'}
          edgeId="user-aurora"
        />

        {/* Edges from Aurora to each model */}
        {MODELS.map((model, index) => {
          const pos = modelPositions[index];
          const isActiveEdge = phase === 'model-thinking' && selectedModelId === model.id;
          
          return (
            <SimpleEdge
              key={model.id}
              fromX={AURORA_NODE.x}
              fromY={AURORA_NODE.y}
              toX={pos.x}
              toY={pos.y}
              isActive={isActiveEdge}
              edgeId={`aurora-${model.id}`}
            />
          );
        })}
      </Svg>

      {/* User Node */}
      <ThinkingNode
        x={USER_NODE.x}
        y={USER_NODE.y}
        label="You"
        isThinking={false}
        isUser
      />

      {/* Aurora Node (center) */}
      <ThinkingNode
        x={AURORA_NODE.x}
        y={AURORA_NODE.y}
        icon={require('../assets/lucidicons/Aurora.png')}
        label="Aurora"
        isThinking={phase === 'aurora-thinking' || phase === 'routing'}
        isAurora
      />

      {/* Model Nodes */}
      {MODELS.map((model, index) => {
        const pos = modelPositions[index];
        const isThinking = phase === 'model-thinking' && selectedModelId === model.id;
        
        return (
          <ThinkingNode
            key={model.id}
            x={pos.x}
            y={pos.y}
            icon={model.icon}
            label={model.label}
            isThinking={isThinking}
          />
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 1000,
  },
  svgLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  nodeContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeGlow: {
    position: 'absolute',
    width: NODE_RADIUS * 3,
    height: NODE_RADIUS * 3,
    borderRadius: NODE_RADIUS * 1.5,
    backgroundColor: 'rgba(42, 157, 91, 0.3)',
    left: -NODE_RADIUS / 2,
    top: -NODE_RADIUS / 2,
  },
  gradientBorder: {
    position: 'absolute',
    width: NODE_RADIUS * 2,
    height: NODE_RADIUS * 2,
    borderRadius: NODE_RADIUS,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: NODE_RADIUS,
  },
  nodeInner: {
    width: NODE_RADIUS * 2 - 6,
    height: NODE_RADIUS * 2 - 6,
    borderRadius: NODE_RADIUS - 3,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(52, 211, 153, 0.5)',
  },
  nodeInnerIdle: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  nodeIcon: {
    width: 32,
    height: 32,
  },
  nodeLabelContainer: {
    position: 'absolute',
    bottom: -25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  nodeLabel: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
  },
});

export default AuroraWorkflow;
