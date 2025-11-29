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
  ActivityIndicator,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Github, Star, Paperclip, ArrowUp, Download, ChevronDown } from 'lucide-react-native';
import { useCactusLM, type Message as CactusMessage } from 'cactus-react-native';
import { AuroraWorkflow } from './components/AuroraWorkflow';
import { TokenText } from './components/TokenText';
import adaptiveRouter, { selectModel, streamCompletion, type RouterResult } from './services/adaptiveRouter';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 768;

// Available local models (HuggingFace models via Cactus)
const AVAILABLE_MODELS = [
  { id: 'qwen3-0.6', name: 'Qwen3 0.6B', size: '~400MB' },
  { id: 'smollm2-360m', name: 'SmolLM2 360M (HF)', size: '~300MB' },
] as const;

// Router model options (for display)
const ROUTER_MODELS = [
  { id: 'qwen3-0.6', name: 'Qwen 3' },
  { id: 'smollm2-360m', name: 'SmolLM2' },
  { id: 'claude-3-5-haiku', name: 'Claude Haiku 4.5' },
  { id: 'claude-opus-4', name: 'Claude Opus 4.5' },
];

type ModelId = typeof AVAILABLE_MODELS[number]['id'];
type WorkflowPhase = 'idle' | 'aurora-thinking' | 'routing' | 'model-thinking' | 'complete';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  preprompt?: string;
  isAnimating?: boolean;
}

export default function App() {
  const [inputValue, setInputValue] = useState('');
  const [starCount, setStarCount] = useState<number | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelId>('qwen3-0.6');
  const [showModelPicker, setShowModelPicker] = useState(false);
  
  // Workflow state
  const [workflowVisible, setWorkflowVisible] = useState(false);
  const [workflowPhase, setWorkflowPhase] = useState<WorkflowPhase>('idle');
  const [routedModelId, setRoutedModelId] = useState<string | undefined>();
  const [hasSubmittedFirstPrompt, setHasSubmittedFirstPrompt] = useState(false);

  // Background color animation (0 = original, 1 = dark blue)
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  // CactusLM Hook - uses selected model
  const cactusLM = useCactusLM({ model: selectedModel });

  // Debug: Log cactusLM state
  useEffect(() => {
    console.log('CactusLM State:', {
      isDownloaded: cactusLM.isDownloaded,
      isDownloading: cactusLM.isDownloading,
      downloadProgress: cactusLM.downloadProgress,
      isGenerating: cactusLM.isGenerating,
      error: cactusLM.error,
    });
  }, [cactusLM.isDownloaded, cactusLM.isDownloading, cactusLM.downloadProgress, cactusLM.error]);

  // Animation values (using React Native Animated)
  const headerSlide = useRef(new Animated.Value(300)).current;
  const badgeSlide = useRef(new Animated.Value(300)).current;
  const titleSlide = useRef(new Animated.Value(300)).current;
  const inputSlide = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    }, 2500);

    return () => clearTimeout(loadingTimer);
  }, []);

  // Animate background when first prompt submitted
  useEffect(() => {
    if (hasSubmittedFirstPrompt) {
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [hasSubmittedFirstPrompt]);

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

  const handleSubmit = async () => {
    if (inputValue.trim()) {
      const userMessage = inputValue.trim();
      setInputValue('');
      
      // Add user message
      setMessages(prev => [...prev, { role: 'user', text: userMessage }]);

      // Mark first prompt for background transition
      if (!hasSubmittedFirstPrompt) {
        setHasSubmittedFirstPrompt(true);
        // Animate background to dark blue
        Animated.timing(backgroundOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }

      // Start Aurora workflow - show workflow and Aurora thinking
      setWorkflowVisible(true);
      setWorkflowPhase('aurora-thinking');
      
      console.log('Aurora Router: Sending to Haiku router brain:', userMessage.substring(0, 50) + '...');

      try {
        // Step 1: Call select-model API (Haiku as router brain)
        // Aurora "thinks" while Haiku decides the best model
        const [routerResult] = await Promise.all([
          selectModel(userMessage), // Send exact user question
          new Promise(resolve => setTimeout(resolve, 2000)), // 2 sec minimum thinking animation
        ]) as [RouterResult, void];

        console.log('Aurora Router selected:', routerResult.displayName);
        console.log('Model type:', routerResult.modelType);
        console.log('Full model name:', routerResult.fullModelName);
        console.log('Reason:', routerResult.reason);

        // Step 2: Animate edge to selected model
        setRoutedModelId(routerResult.modelId);
        setWorkflowPhase('routing');
        
        // Wait for edge animation (0.8 sec)
        await new Promise(resolve => setTimeout(resolve, 800));

        // Step 3: Selected model "thinking"
        setWorkflowPhase('model-thinking');

        // Add placeholder message for streaming response
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text: '', 
          preprompt: routerResult.reason,
          isAnimating: true 
        }]);

        // Step 4: Route to appropriate backend
        let fullResponse = '';
        
        if (routerResult.modelType === 'local') {
          // Use CactusLM for local model inference
          console.log('Using CactusLM for local model:', routerResult.fullModelName);
          
          // Check if model is downloaded
          if (!cactusLM.isDownloaded) {
            fullResponse = `⚠️ The local model "${routerResult.displayName}" is not downloaded yet. Please download it first from the home screen, or try asking again and I'll route to a cloud model.`;
            
            // Update message
            setMessages(prev => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  text: fullResponse,
                  isAnimating: false,
                };
              }
              return updated;
            });
          } else {
            // Run local inference with CactusLM
            try {
              const cactusMessages: CactusMessage[] = [
                { role: 'user', content: userMessage }
              ];
              
              await cactusLM.complete({
                messages: cactusMessages,
                onToken: (token: string) => {
                  fullResponse += token;
                  setMessages(prev => {
                    const updated = [...prev];
                    const lastIndex = updated.length - 1;
                    if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                      updated[lastIndex] = {
                        ...updated[lastIndex],
                        text: fullResponse,
                      };
                    }
                    return updated;
                  });
                },
              });
              
              // Mark animation complete
              setMessages(prev => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                  updated[lastIndex] = {
                    ...updated[lastIndex],
                    isAnimating: false,
                  };
                }
                return updated;
              });
            } catch (localError) {
              console.error('CactusLM error:', localError);
              fullResponse = `⚠️ Local model error. Falling back message: The local model encountered an issue. Please try again.`;
              setMessages(prev => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                  updated[lastIndex] = {
                    ...updated[lastIndex],
                    text: fullResponse,
                    isAnimating: false,
                  };
                }
                return updated;
              });
            }
          }
        } else {
          // Use cloud model via Anthropic API
          const result = await streamCompletion(
            userMessage,
            routerResult.fullModelName,
            (token) => {
              fullResponse += token;
              setMessages(prev => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                  updated[lastIndex] = {
                    ...updated[lastIndex],
                    text: fullResponse,
                  };
                }
                return updated;
              });
            },
            () => {
              setMessages(prev => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                  updated[lastIndex] = {
                    ...updated[lastIndex],
                    isAnimating: false,
                  };
                }
                return updated;
              });
            },
            routerResult.modelType
          );
        }

        // Step 5: Complete workflow
        setWorkflowPhase('complete');
        
        // Hide workflow after a brief moment
        await new Promise(resolve => setTimeout(resolve, 500));
        setWorkflowVisible(false);
        setWorkflowPhase('idle');
        setRoutedModelId(undefined);

      } catch (error) {
        console.error('Aurora Router error:', error);
        
        // Add error message
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
          preprompt: '⚠️ Error occurred during routing',
          isAnimating: false 
        }]);

        // Hide workflow
        setWorkflowVisible(false);
        setWorkflowPhase('idle');
        setRoutedModelId(undefined);
      }
    }
  };

  // Handle model download
  const handleDownloadModel = async () => {
    if (cactusLM.isDownloading) return;
    
    try {
      await cactusLM.download();
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  // Loading Screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Image
            source={require('./assets/images/aurora_logo.png')}
            style={{ width: 120, height: 120 }}
            contentFit="contain"
          />
          <Text style={{ color: 'white', fontSize: 24, marginTop: 20, fontWeight: 'bold' }}>
            Aurora AI
          </Text>
          <ActivityIndicator size="large" color="#34d399" style={{ marginTop: 30 }} />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('./assets/images/bgada.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark blue overlay after first prompt */}
        <Animated.View style={[styles.backgroundOverlay, { opacity: backgroundOpacity }]} />
        
        <StatusBar barStyle="light-content" />

        {/* Header - pushed down */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: headerSlide }] }}>
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
            {messages.length === 0 && !workflowVisible && (
              <Animated.View style={[styles.centerContent, { opacity: fadeAnim, transform: [{ translateX: badgeSlide }] }]}>
                <LinearGradient
                  colors={['rgba(52, 211, 153, 0.2)', 'rgba(190, 242, 100, 0.2)']}
                  style={styles.badge}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.badgeText}>adaptive v 1.0</Text>
                </LinearGradient>

                {/* Model Status */}
                <View style={styles.modelStatus}>
                  {/* Model Selector */}
                  <TouchableOpacity 
                    style={styles.modelSelector}
                    onPress={() => setShowModelPicker(!showModelPicker)}
                  >
                    <Text style={styles.modelStatusLabel}>
                      Model: {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}
                    </Text>
                    <ChevronDown color="#9ca3af" size={16} />
                  </TouchableOpacity>

                  {/* Model Picker Dropdown */}
                  {showModelPicker && (
                    <View style={styles.modelPickerDropdown}>
                      {AVAILABLE_MODELS.map((model) => (
                        <TouchableOpacity
                          key={model.id}
                          style={[
                            styles.modelOption,
                            selectedModel === model.id && styles.modelOptionSelected
                          ]}
                          onPress={() => {
                            setSelectedModel(model.id);
                            setShowModelPicker(false);
                          }}
                        >
                          <Text style={[
                            styles.modelOptionText,
                            selectedModel === model.id && styles.modelOptionTextSelected
                          ]}>
                            {model.name}
                          </Text>
                          <Text style={styles.modelOptionSize}>{model.size}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Download Status */}
                  {cactusLM.isDownloaded ? (
                    <View style={styles.downloadProgress}>
                      <Text style={[styles.modelStatusText, { color: '#34d399' }]}>
                        ✓ {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name} Ready
                      </Text>
                    </View>
                  ) : cactusLM.isDownloading ? (
                    <View style={styles.downloadProgress}>
                      <ActivityIndicator size="small" color="#34d399" />
                      <Text style={styles.modelStatusText}>
                        Downloading: {Math.round((cactusLM.downloadProgress || 0) * 100)}%
                      </Text>
                    </View>
                  ) : cactusLM.error ? (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={styles.errorText}>Download failed - check your connection</Text>
                      <TouchableOpacity style={[styles.downloadButton, { marginTop: 8 }]} onPress={handleDownloadModel}>
                        <Download color="#34d399" size={16} />
                        <Text style={styles.downloadButtonText}>Retry Download</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                  <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadModel}>
                    <Download color="#34d399" size={16} />
                    <Text style={styles.downloadButtonText}>
                      Download {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name} ({AVAILABLE_MODELS.find(m => m.id === selectedModel)?.size})
                    </Text>
                  </TouchableOpacity>
                )}
                </View>
              </Animated.View>
            )}

            {/* Messages Display */}
            {messages.length > 0 && !workflowVisible && (
              <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
                {messages.map((message, index) => (
                  <View
                    key={index}
                    style={[
                      styles.messageWrapper,
                      message.role === 'user' ? styles.userMessage : styles.botMessage,
                    ]}
                  >
                    {/* Preprompt for assistant messages */}
                    {message.role === 'assistant' && message.preprompt && (
                      <TokenText
                        text={message.preprompt}
                        speed={15}
                        isPreprompt
                        containerStyle={styles.prepromptContainer}
                      />
                    )}
                    <View style={[
                      styles.messageBubble,
                      message.role === 'user' ? styles.userBubble : styles.botBubble
                    ]}>
                      {message.role === 'assistant' && message.isAnimating ? (
                        <TokenText
                          text={message.text}
                          speed={20}
                          style={styles.messageText}
                        />
                      ) : (
                        <Text style={[
                          styles.messageText,
                          message.role === 'user' && styles.userMessageText
                        ]}>
                          {message.text}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Input Area */}
          <View style={styles.inputWrapper}>
            {messages.length === 0 && !workflowVisible && (
              <Animated.View style={[styles.titleContainer, { opacity: fadeAnim, transform: [{ translateX: titleSlide }] }]}>
                <Text style={styles.mainTitle}>Optimize your LLM usage</Text>
                <Text style={styles.subtitle}>with Aurora AI</Text>
              </Animated.View>
            )}

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: inputSlide }] }}>
              <BlurView intensity={90} tint="dark" style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder={displayedText}
                  placeholderTextColor="rgba(167, 243, 208, 0.5)"
                  multiline
                  numberOfLines={3}
                  editable={!workflowVisible}
                />
                <View style={styles.inputActions}>
                  <TouchableOpacity style={styles.iconButton}>
                    <Paperclip color="#a7f3d0" size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      (!inputValue.trim() || workflowVisible) && styles.sendButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={!inputValue.trim() || workflowVisible}
                  >
                    {workflowVisible ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <ArrowUp color="white" size={20} />
                    )}
                  </TouchableOpacity>
                </View>
              </BlurView>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>

        {/* Aurora Workflow Overlay */}
        <AuroraWorkflow
          visible={workflowVisible}
          phase={workflowPhase}
          selectedModelId={routedModelId}
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? 12 : 20,
    paddingVertical: isSmallScreen ? 12 : 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 36,
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
  messagesContent: {
    paddingVertical: 20,
  },
  messageWrapper: {
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: 'rgba(52, 211, 153, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  botBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  messageText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
  },
  userMessageText: {
    color: '#a7f3d0',
  },
  prepromptContainer: {
    marginBottom: 8,
    paddingLeft: 4,
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
  modelStatus: {
    marginTop: 16,
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    minWidth: 250,
  },
  modelStatusLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modelStatusText: {
    color: '#a7f3d0',
    fontSize: 14,
    fontWeight: '500',
  },
  downloadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#34d399',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
  },
  downloadButtonText: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 8,
  },
  modelSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  modelPickerDropdown: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    zIndex: 100,
    overflow: 'hidden',
  },
  modelOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modelOptionSelected: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
  },
  modelOptionText: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '500',
  },
  modelOptionTextSelected: {
    color: '#34d399',
  },
  modelOptionSize: {
    color: '#6b7280',
    fontSize: 12,
  },
});
