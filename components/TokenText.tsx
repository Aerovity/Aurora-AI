import React, { useEffect, useState, useRef } from 'react';
import { Text, View, StyleSheet, TextStyle, ViewStyle, Animated } from 'react-native';

interface TokenTextProps {
  text: string;
  speed?: number; // ms per character
  style?: TextStyle;
  containerStyle?: ViewStyle;
  onComplete?: () => void;
  isPreprompt?: boolean; // Different styling for preprompt
}

export const TokenText: React.FC<TokenTextProps> = ({
  text,
  speed = 20,
  style,
  containerStyle,
  onComplete,
  isPreprompt = false,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  // Blinking cursor animation
  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, []);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;

    if (!text) return;

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  if (isPreprompt) {
    return (
      <View style={[styles.prepromptContainer, containerStyle]}>
        <Text style={[styles.prepromptText, style]}>
          {displayedText}
          {!isComplete && (
            <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>|</Animated.Text>
          )}
        </Text>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={[styles.defaultText, style]}>
        {displayedText}
        {!isComplete && (
          <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>|</Animated.Text>
        )}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  prepromptContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  prepromptText: {
    color: 'rgba(167, 243, 208, 0.9)',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  defaultText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
  },
  cursor: {
    color: '#34d399',
    fontWeight: 'bold',
  },
});

export default TokenText;
