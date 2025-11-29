/**
 * ModelLoadingScreen Component
 *
 * Shows loading video with model download progress bars overlaid on top
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 768;

interface ModelLoadingScreenProps {
  qwenProgress: number;   // 0 to 1
  gemmaProgress: number;  // 0 to 1
}

export function ModelLoadingScreen({ qwenProgress, gemmaProgress }: ModelLoadingScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Video player for loading screen
  const videoPlayer = useVideoPlayer(require('../assets/loading.mp4'), player => {
    player.loop = true;
    player.play();
  });

  useEffect(() => {
    // Fade in and slide up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const overallProgress = (qwenProgress + gemmaProgress) / 2;

  return (
    <View style={styles.container}>
      {/* Background Video */}
      <VideoView
        player={videoPlayer}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Overlay with Progress Bars */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <BlurView intensity={40} tint="dark" style={styles.progressContainer}>
          {/* Title */}
          <Text style={styles.title}>Loading AI Models</Text>
          <Text style={styles.subtitle}>
            Preparing on-device intelligence...
          </Text>

          {/* Overall Progress */}
          <View style={styles.overallProgressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Overall Progress</Text>
              <Text style={styles.progressPercentage}>
                {Math.round(overallProgress * 100)}%
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <LinearGradient
                colors={['#34d399', '#bef264']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBar, { width: `${overallProgress * 100}%` }]}
              />
            </View>
          </View>

          {/* Individual Model Progress */}
          <View style={styles.modelsSection}>
            {/* Qwen Progress */}
            <View style={styles.modelProgress}>
              <View style={styles.modelHeader}>
                <View style={styles.modelInfo}>
                  <Text style={styles.modelName}>Qwen 0.5B</Text>
                  <Text style={styles.modelSize}>~600MB</Text>
                </View>
                <Text style={styles.modelPercentage}>
                  {Math.round(qwenProgress * 100)}%
                </Text>
              </View>
              <View style={styles.modelProgressBarContainer}>
                <View
                  style={[
                    styles.modelProgressBar,
                    { width: `${qwenProgress * 100}%` },
                  ]}
                />
              </View>
            </View>

            {/* Gemma Progress */}
            <View style={styles.modelProgress}>
              <View style={styles.modelHeader}>
                <View style={styles.modelInfo}>
                  <Text style={styles.modelName}>Gemma 1B</Text>
                  <Text style={styles.modelSize}>~1GB</Text>
                </View>
                <Text style={styles.modelPercentage}>
                  {Math.round(gemmaProgress * 100)}%
                </Text>
              </View>
              <View style={styles.modelProgressBarContainer}>
                <View
                  style={[
                    styles.modelProgressBar,
                    { width: `${gemmaProgress * 100}%` },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Status Text */}
          <Text style={styles.statusText}>
            {overallProgress < 1
              ? 'Downloading models for the first time...'
              : 'Models ready!'}
          </Text>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 500,
    padding: isSmallScreen ? 24 : 32,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    backgroundColor: 'rgba(5, 17, 33, 0.85)',
    overflow: 'hidden',
  },
  title: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#a7f3d0',
    textAlign: 'center',
    marginBottom: 32,
  },
  overallProgressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d1d5db',
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34d399',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  modelsSection: {
    gap: 16,
    marginBottom: 24,
  },
  modelProgress: {
    gap: 8,
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modelName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  modelSize: {
    fontSize: 12,
    color: '#9ca3af',
  },
  modelPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a7f3d0',
  },
  modelProgressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  modelProgressBar: {
    height: '100%',
    backgroundColor: '#34d399',
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
});
