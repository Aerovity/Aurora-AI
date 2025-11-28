import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Dimensions,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Github, Star, Paperclip, ArrowUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 768;

export default function App() {
  const [inputValue, setInputValue] = useState('');
  const [starCount, setStarCount] = useState<number | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  // Animation values
  const headerSlide = useRef(new Animated.Value(300)).current;
  const badgeSlide = useRef(new Animated.Value(300)).current;
  const titleSlide = useRef(new Animated.Value(300)).current;
  const inputSlide = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Video player for loading screen
  const videoPlayer = useVideoPlayer(require('./assets/loading.mp4'), player => {
    player.loop = true;
    player.play();
  });

  const placeholders = [
    'Ask me anything about LLM optimization...',
    'How can I reduce my AI costs?',
    "What's the best model for my use case?",
  ];

  // Handle loading screen and start animations
  useEffect(() => {
    // Fade in the loading screen logo
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Simulate loading duration
    const loadingTimer = setTimeout(() => {
      // Fade out loading screen
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setIsLoading(false);
        setShowContent(true);

        // Reset fade for main content
        fadeAnim.setValue(0);

        // Start animations after loading screen
        Animated.stagger(150, [
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(headerSlide, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.spring(badgeSlide, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.spring(titleSlide, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.spring(inputSlide, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 2500); // 2.5 seconds for loading screen

    return () => clearTimeout(loadingTimer);
  }, []);

  useEffect(() => {
    fetch('https://api.github.com/repos/Egham-7/adaptive_router')
      .then((res) => res.json())
      .then((data) => setStarCount(data.stargazers_count))
      .catch(() => setStarCount(null));
  }, []);

  useEffect(() => {
    const currentPlaceholder = placeholders[placeholderIndex];
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 30);
      } else {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
      }
    } else {
      if (displayedText.length < currentPlaceholder.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentPlaceholder.slice(0, displayedText.length + 1));
        }, 50);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, placeholderIndex]);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { role: 'user', text: inputValue }]);
      setInputValue('');
    }
  };

  // Loading Screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <VideoView
          player={videoPlayer}
          style={styles.loadingVideo}
          contentFit="cover"
          nativeControls={false}
        />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('./assets/images/bgada.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateX: headerSlide }],
        }}
      >
        <BlurView intensity={80} tint="dark" style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('./assets/images/aurora_logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.logoText}>Aurora AI</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.githubButton}>
            <Github color="white" size={isSmallScreen ? 12 : 14} />
            <Star color="white" size={isSmallScreen ? 12 : 14} />
            {!isSmallScreen && starCount && (
              <Text style={styles.buttonText}>{starCount.toLocaleString()}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.buttonText}>{isSmallScreen ? 'Start' : 'Get Started'}</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Main Content */}
        <View style={styles.mainContent}>
          {messages.length === 0 && (
            <Animated.View
              style={[
                styles.centerContent,
                {
                  opacity: fadeAnim,
                  transform: [{ translateX: badgeSlide }],
                }
              ]}
            >
              <LinearGradient
                colors={['rgba(52, 211, 153, 0.2)', 'rgba(190, 242, 100, 0.2)']}
                style={styles.badge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.badgeText}>adaptive v 1.0</Text>
              </LinearGradient>
            </Animated.View>
          )}

          {messages.length > 0 && (
            <ScrollView style={styles.messagesContainer}>
              {messages.map((message, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageWrapper,
                    message.role === 'user' ? styles.userMessage : styles.botMessage,
                  ]}
                >
                  <View style={styles.messageBubble}>
                    <Text style={styles.messageText}>{message.text}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Input Area */}
        <View style={styles.inputWrapper}>
          {messages.length === 0 && (
            <Animated.View
              style={[
                styles.titleContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateX: titleSlide }],
                }
              ]}
            >
              <Text style={styles.mainTitle}>Optimize your LLM usage</Text>
              <Text style={styles.subtitle}>with Aurora AI</Text>
            </Animated.View>
          )}

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: inputSlide }],
            }}
          >
            <BlurView intensity={90} tint="dark" style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={displayedText}
              placeholderTextColor="rgba(167, 243, 208, 0.5)"
              multiline
              numberOfLines={3}
            />
            <View style={styles.inputActions}>
              <TouchableOpacity style={styles.iconButton}>
                <Paperclip color="#a7f3d0" size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendButton, !inputValue.trim() && styles.sendButtonDisabled]}
                onPress={handleSubmit}
                disabled={!inputValue.trim()}
              >
                <ArrowUp color="white" size={20} />
              </TouchableOpacity>
            </View>
          </BlurView>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? 12 : 20,
    paddingVertical: isSmallScreen ? 12 : 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: 'rgba(5, 17, 33, 0.7)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logo: {
    width: isSmallScreen ? 32 : 40,
    height: isSmallScreen ? 32 : 40,
  },
  logoText: {
    color: 'white',
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  githubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: isSmallScreen ? 8 : 12,
    paddingVertical: isSmallScreen ? 4 : 6,
    borderWidth: 2,
    borderColor: '#34d399',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  startButton: {
    paddingHorizontal: isSmallScreen ? 12 : 20,
    paddingVertical: isSmallScreen ? 4 : 6,
    borderWidth: 2,
    borderColor: '#34d399',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: 'white',
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centerContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.5)',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a7f3d0',
  },
  messagesContainer: {
    flex: 1,
    width: '100%',
  },
  messageWrapper: {
    marginVertical: 8,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  messageText: {
    fontSize: 16,
    color: '#1f2937',
  },
  inputWrapper: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: isSmallScreen ? 32 : 48,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: isSmallScreen ? 18 : 20,
    color: '#d1d5db',
    textAlign: 'center',
  },
  inputContainer: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#34d399',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    overflow: 'hidden',
  },
  input: {
    minHeight: 120,
    paddingHorizontal: 24,
    paddingVertical: 24,
    color: 'white',
    fontSize: 16,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    borderWidth: 1,
    borderColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingVideo: {
    width: '100%',
    height: '100%',
  },
});
