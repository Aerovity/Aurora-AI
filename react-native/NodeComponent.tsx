import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient'; // You'll need to install this
import type { Node } from './types';

const NODE_RADIUS = 30;

interface NodeComponentProps {
  node: Node;
}

const NodeComponent: React.FC<NodeComponentProps> = ({ node }) => {
  const isThinking = node.state === 'thinking';
  const isLLM = node.type === 'llm';

  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(isThinking ? 1.1 : 1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  }, [isThinking]);

  useEffect(() => {
    if (isThinking) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [isThinking]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Particle animations for LLM nodes (3 particles with stagger delays)
  const particle1X = useSharedValue(0);
  const particle1Y = useSharedValue(0);
  const particle1Scale = useSharedValue(0);

  const particle2X = useSharedValue(0);
  const particle2Y = useSharedValue(0);
  const particle2Scale = useSharedValue(0);

  const particle3X = useSharedValue(0);
  const particle3Y = useSharedValue(0);
  const particle3Scale = useSharedValue(0);

  useEffect(() => {
    if (isLLM && isThinking) {
      // Particle 1 at 0° (no delay)
      const angle1 = 0;
      const radians1 = (angle1 * Math.PI) / 180;
      const targetX1 = Math.cos(radians1) * 45; // NODE_RADIUS + 15
      const targetY1 = Math.sin(radians1) * 45;

      particle1X.value = withRepeat(
        withTiming(targetX1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      particle1Y.value = withRepeat(
        withTiming(targetY1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      particle1Scale.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );

      // Particle 2 at 120° (300ms delay)
      setTimeout(() => {
        const angle2 = 120;
        const radians2 = (angle2 * Math.PI) / 180;
        const targetX2 = Math.cos(radians2) * 45;
        const targetY2 = Math.sin(radians2) * 45;

        particle2X.value = withRepeat(
          withTiming(targetX2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
        particle2Y.value = withRepeat(
          withTiming(targetY2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
        particle2Scale.value = withRepeat(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
      }, 300);

      // Particle 3 at 240° (600ms delay)
      setTimeout(() => {
        const angle3 = 240;
        const radians3 = (angle3 * Math.PI) / 180;
        const targetX3 = Math.cos(radians3) * 45;
        const targetY3 = Math.sin(radians3) * 45;

        particle3X.value = withRepeat(
          withTiming(targetX3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
        particle3Y.value = withRepeat(
          withTiming(targetY3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
        particle3Scale.value = withRepeat(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
      }, 600);
    } else {
      particle1X.value = withTiming(0, { duration: 200 });
      particle1Y.value = withTiming(0, { duration: 200 });
      particle1Scale.value = withTiming(0, { duration: 200 });

      particle2X.value = withTiming(0, { duration: 200 });
      particle2Y.value = withTiming(0, { duration: 200 });
      particle2Scale.value = withTiming(0, { duration: 200 });

      particle3X.value = withTiming(0, { duration: 200 });
      particle3Y.value = withTiming(0, { duration: 200 });
      particle3Scale.value = withTiming(0, { duration: 200 });
    }
  }, [isLLM, isThinking]);

  const particleColors = ['#2A9D5B', '#4DB84F', '#6FBF4C'];

  const particle1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: particle1X.value },
      { translateY: particle1Y.value },
      { scale: particle1Scale.value },
    ],
  }));

  const particle2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: particle2X.value },
      { translateY: particle2Y.value },
      { scale: particle2Scale.value },
    ],
  }));

  const particle3Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: particle3X.value },
      { translateY: particle3Y.value },
      { scale: particle3Scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.nodeContainer,
        {
          left: node.x - NODE_RADIUS,
          top: node.y - NODE_RADIUS,
          width: NODE_RADIUS * 2,
          height: NODE_RADIUS * 2,
        },
        animatedStyle,
      ]}
    >
      {/* Node border and background */}
      <View style={styles.nodeBorder}>
        {/* Inner circle background */}
        <View style={styles.innerCircle} />

        {isThinking ? (
          <>
            {/* Emerald gradient border - rotating */}
            <Animated.View style={[styles.gradientBorder, rotationStyle]}>
              <LinearGradient
                colors={[
                  '#C8DC3C',
                  '#B8D848',
                  '#6FBF4C',
                  '#4DB84F',
                  '#2A9D5B',
                  '#1F8B5E',
                  '#176B58',
                  '#125B52',
                  '#C8DC3C',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              />
            </Animated.View>

            {/* Outer glow */}
            <View style={styles.outerGlow} />
          </>
        ) : (
          <View style={styles.idleBorder} />
        )}
      </View>

      {/* LLM thinking particles */}
      {isLLM && isThinking && (
        <View style={styles.particlesContainer}>
          <Animated.View
            style={[
              styles.particle,
              {
                backgroundColor: particleColors[0],
                shadowColor: particleColors[0],
              },
              particle1Style,
            ]}
          />
          <Animated.View
            style={[
              styles.particle,
              {
                backgroundColor: particleColors[1],
                shadowColor: particleColors[1],
              },
              particle2Style,
            ]}
          />
          <Animated.View
            style={[
              styles.particle,
              {
                backgroundColor: particleColors[2],
                shadowColor: particleColors[2],
              },
              particle3Style,
            ]}
          />
        </View>
      )}

      {/* Node label */}
      <View style={styles.labelContainer}>
        <View style={styles.label}>
          <Text style={styles.labelText}>{node.label}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  nodeContainer: {
    position: 'absolute',
  },
  nodeBorder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: NODE_RADIUS,
    overflow: 'visible',
  },
  innerCircle: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    borderRadius: NODE_RADIUS - 3,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 10,
  },
  gradientBorder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: NODE_RADIUS,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: NODE_RADIUS,
  },
  outerGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: NODE_RADIUS,
    shadowColor: 'rgba(42, 157, 91, 1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
  },
  idleBorder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: NODE_RADIUS,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    left: '50%',
    top: '50%',
    marginLeft: -4,
    marginTop: -4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  labelContainer: {
    position: 'absolute',
    top: -40,
    left: '50%',
    transform: [{ translateX: -50 }],
  },
  label: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  labelText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default NodeComponent;
