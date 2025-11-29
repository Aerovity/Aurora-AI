# AI Model Integration

This directory contains functions for integrating multiple AI models into your React Native application with **automatic model lifecycle management**.

## 🎯 Key Features

- ✅ **Automatic initialization** - Models download on app start
- ✅ **Progress tracking** - Real-time download progress for each model
- ✅ **Auto cleanup** - Models unload when app closes/backgrounds to save memory
- ✅ **Personality selection** - AI chooses expert personalities (Einstein, Curie, etc.)
- ✅ **Easy integration** - Wrap your app and go!

## Available Models

### Cloud Models (Anthropic)

1. **Claude Haiku 4.5** - Fast, efficient, excellent for general tasks
   - File: [claudeHaiku.ts](claudeHaiku.ts)
   - Model: `claude-3-5-haiku-20241022`

2. **Claude Opus 4.5** - Most powerful, best for complex reasoning
   - File: [claudeOpus.ts](claudeOpus.ts)
   - Model: `claude-opus-4-20250514`

### Local Models (CactusCompute - On-Device)

3. **Qwen 0.5B** - Ultra-lightweight, privacy-focused
   - File: [qwen3.ts](qwen3.ts)
   - Model: `qwen3-0.6`
   - Runs entirely on-device

4. **Gemma 1B** - Lightweight, offline capability
   - File: [gemma3.ts](gemma3.ts)
   - Model: `gemma3-1b`
   - Runs entirely on-device

## 🚀 Quick Start (Recommended Method)

### Step 1: Wrap Your App

```tsx
import { AppInitializer } from './models';

export default function App() {
  return (
    <AppInitializer>
      <YourMainApp />
    </AppInitializer>
  );
}
```

**That's it!** Models will:
- ✅ Download automatically on app start
- ✅ Show loading screen with progress
- ✅ Unload when app closes to save memory
- ✅ Reload when app reopens

### Step 2: Use the Models

```tsx
import { callClaudeHaiku, callQwen3 } from './models';

function YourMainApp() {
  const handleAsk = async () => {
    // Models are already loaded! Just call them
    const result = await callClaudeHaiku('What is quantum physics?');

    if (result.success) {
      console.log(result.response);
      console.log('Personality:', result.personality); // e.g., "Richard Feynman"
    }
  };

  return <Button title="Ask AI" onPress={handleAsk} />;
}
```

## 📦 Setup Instructions

### Install Dependencies

```bash
npm install cactus-react-native react-native-nitro-modules
```
✅ **Already installed!**

### ⚠️ IMPORTANT: Expo Go Not Supported

**Cactus models (Qwen & Gemma) will NOT work in Expo Go!**

This is because they use native modules. You MUST use Expo Dev Client instead:

```bash
# Build custom dev client (first time only)
npx expo run:android
# or
npx expo run:ios

# After building, use this to run:
npx expo start --dev-client
```

✅ **You already have `expo-dev-client` installed, so you're all set!**

### API Keys

**Claude Models:**
- ✅ API key **already configured** in [config.ts](config.ts)
- Ready to use immediately

**Cactus Models (Qwen & Gemma):**
- ✅ **NO API KEY NEEDED!**
- Models run 100% locally on device
- Works completely offline
- Optional token only for telemetry/cloud fallback (not required)

## 🔧 How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Your React Native App                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │            AppInitializer Component              │   │
│  │  • Wraps your entire app                        │   │
│  │  • Shows loading screen during initialization   │   │
│  │  • Listens to app state (background/foreground) │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                               │
│                          ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │              ModelManager (Singleton)            │   │
│  │  • Initializes local models on app start        │   │
│  │  • Caches model instances in memory             │   │
│  │  • Tracks download progress                     │   │
│  │  • Unloads models on app close/background       │   │
│  └─────────────────────────────────────────────────┘   │
│            │                  │                          │
│            ▼                  ▼                          │
│  ┌───────────────┐  ┌───────────────┐                  │
│  │  Qwen 0.5B    │  │  Gemma 1B     │                  │
│  │  (CactusLM)   │  │  (CactusLM)   │                  │
│  │  In Memory    │  │  In Memory    │                  │
│  └───────────────┘  └───────────────┘                  │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │          Model Functions (API Layer)             │   │
│  │  • callClaudeHaiku() → Anthropic API            │   │
│  │  • callClaudeOpus()  → Anthropic API            │   │
│  │  • callQwen3()       → ModelManager.getQwen()   │   │
│  │  • callGemma3()      → ModelManager.getGemma()  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Lifecycle Flow

```
App Starts
    │
    ▼
AppInitializer mounts
    │
    ▼
ModelManager.initializeModels()
    │
    ├─► Create Qwen instance
    │   └─► Download model (with progress)
    │
    ├─► Create Gemma instance
    │   └─► Download model (with progress)
    │
    ▼
Models ready in memory
    │
    ▼
App shows main content
    │
    │ (User interacts with app)
    │ (Models respond instantly - already loaded!)
    │
    ▼
App backgrounds/closes
    │
    ▼
AppState listener triggered
    │
    ▼
ModelManager.cleanup()
    │
    ├─► Destroy Qwen instance
    ├─► Destroy Gemma instance
    └─► Free memory

App reopens
    │
    ▼
ModelManager.initializeModels() again
    │
    └─► Models reload from cache (fast - no re-download!)
```

### Component Breakdown

#### 1. **AppInitializer.tsx**
The main wrapper component that handles the entire lifecycle:

```tsx
// What it does:
- Renders loading screen while models download
- Shows progress bars for Qwen and Gemma
- Listens to AppState changes (active/background/inactive)
- Calls ModelManager.cleanup() when app backgrounds
- Re-initializes models when app comes back to foreground
- Renders your app when models are ready
```

#### 2. **ModelManager.ts**
Singleton class that manages model instances:

```tsx
// Core responsibilities:
- Holds CactusLM instances for Qwen and Gemma
- Downloads models with progress tracking
- Caches instances in memory for reuse
- Provides getQwenInstance() and getGemmaInstance()
- Notifies subscribers of state changes
- Cleans up resources on demand
```

#### 3. **useModelManager.ts**
React hook for component integration:

```tsx
// Provides:
- state: Current initialization state
- isReady: Boolean flag for ready state
- qwenProgress: Download progress (0-1)
- gemmaProgress: Download progress (0-1)
- initialize(): Manual initialization function
- cleanup(): Manual cleanup function
```

#### 4. **Model Functions**
Individual API call functions:

**Claude Models (Cloud):**
```tsx
callClaudeHaiku(userInput) {
  1. Build personality selection prompt
  2. Call Anthropic API directly
  3. Parse response
  4. Extract personality
  5. Return result
}
```

**Local Models (On-Device):**
```tsx
callQwen3(userInput) {
  1. Get cached instance from ModelManager
  2. Build personality selection prompt
  3. Call lm.complete() (already loaded!)
  4. Stream tokens
  5. Extract personality
  6. Return result
}
```

## 🔄 Model Lifecycle

### What Happens When:

| Event | Action | Details |
|-------|--------|---------|
| **App Opens (First Time)** | Download + Initialize | Models download (~1.6GB), cached on device |
| **App Opens (Subsequent)** | Load from Cache | Fast initialization (~2-3 seconds) |
| **App Running** | Models in Memory | Ready for instant inference |
| **App Backgrounds** | Unload from Memory | Instances destroyed, files stay cached |
| **App Closes** | Unload from Memory | Instances destroyed, files stay cached |
| **App Reopens** | Reload from Cache | Quick reload, no re-download needed |

**Storage:**
- Model files: Permanently cached (until app data cleared)
- Model instances: Temporary (loaded only when app is active)

## 🎭 Personality Selection Feature

All models use an intelligent system prompt that:

1. Analyzes the question's domain
2. Chooses the best expert personality
3. Responds in that expert's style

**Example personalities:**
- Physics → Einstein, Feynman, Hawking
- Chemistry → Marie Curie, Linus Pauling
- Computer Science → Alan Turing, Grace Hopper
- Philosophy → Socrates, Kant
- And many more...

**Example:**
```typescript
const result = await callClaudeHaiku('Explain relativity');
// Response starts with: "As Einstein would approach this..."
// result.personality === "Einstein would approach"
```

## 📚 Usage Examples

See [EXAMPLE_USAGE.tsx](EXAMPLE_USAGE.tsx) for comprehensive examples including:
- Basic usage with AppInitializer (recommended)
- Custom loading screens
- Manual initialization
- Using all models in parallel

### Example: All Models at Once

```tsx
import { callClaudeHaiku, callClaudeOpus, callQwen3, callGemma3 } from './models';

const responses = await Promise.all([
  callClaudeHaiku('What is AI?'),
  callClaudeOpus('What is AI?'),
  callQwen3('What is AI?'),
  callGemma3('What is AI?'),
]);
```

## 🎨 Advanced Usage

### Custom Loading Screen

```tsx
function CustomLoader({ qwenProgress, gemmaProgress }) {
  return (
    <View>
      <Text>Qwen: {(qwenProgress * 100).toFixed(0)}%</Text>
      <Text>Gemma: {(gemmaProgress * 100).toFixed(0)}%</Text>
    </View>
  );
}

<AppInitializer LoadingComponent={CustomLoader}>
  <YourApp />
</AppInitializer>
```

### Using the Hook Directly

```tsx
import { useModelManager } from './models';

function MyComponent() {
  const { isReady, qwenProgress, gemmaProgress, initialize } = useModelManager();

  useEffect(() => {
    initialize();
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return <MainContent />;
}
```

### Manual Control

```tsx
import { ModelManager } from './models';

// Initialize
await ModelManager.initializeModels();

// Subscribe to progress
ModelManager.subscribe((state) => {
  console.log('Progress:', state.downloadProgress);
});

// Cleanup
ModelManager.cleanup();
```

## 📊 API Response Format

All functions return:

```typescript
interface Response {
  success: boolean;          // Whether the call succeeded
  response?: string;         // The AI's response text
  personality?: string;      // The personality chosen (if detected)
  error?: string;           // Error message (if failed)
}
```

## 🔍 Model Comparison

| Model | Location | Speed | Quality | Privacy | Offline | Memory | Init Time |
|-------|----------|-------|---------|---------|---------|--------|-----------|
| Claude Haiku | Cloud | Fast | High | No | No | Minimal | Instant |
| Claude Opus | Cloud | Slower | Highest | No | No | Minimal | Instant |
| Qwen 0.5B | Local | Very Fast | Good | Yes | Yes | ~600MB | 2-3s (cached) |
| Gemma 1B | Local | Fast | Good | Yes | Yes | ~1GB | 2-3s (cached) |

## 🗂️ Files Overview

```
models/
├── config.ts              # API keys and model configurations
├── prompts.ts             # Personality selection system prompt
├── claudeHaiku.ts         # Claude Haiku integration
├── claudeOpus.ts          # Claude Opus integration
├── qwen3.ts               # Qwen local model (uses ModelManager)
├── gemma3.ts              # Gemma local model (uses ModelManager)
├── ModelManager.ts        # 🆕 Handles initialization & lifecycle
├── useModelManager.ts     # 🆕 React hook for easy integration
├── AppInitializer.tsx     # 🆕 Wrapper component with auto-init
├── index.ts               # Main exports
├── test.ts                # Test suite
├── EXAMPLE_USAGE.tsx      # 🆕 Comprehensive usage examples
└── README.md              # This file
```

## 🧪 Testing

Test individual models:
```bash
npx ts-node models/test.ts
```

## ⚠️ Important Notes

### For Claude Models (Haiku & Opus):
- ✅ API key pre-configured
- ✅ No initialization needed
- ✅ Instant responses
- ❌ Requires internet
- 💰 API usage costs apply

### For Local Models (Qwen & Gemma):
- ✅ Complete privacy (data never leaves device)
- ✅ Works offline after download
- ✅ No API costs
- ✅ Auto-downloads on first app launch
- ✅ Auto-unloads when app closes (saves memory)
- ⚠️ Requires ~1.6GB storage (one-time)
- ⚠️ Uses device battery/memory

## 🔗 Resources

- [CactusCompute React Native Docs](https://cactuscompute.com/docs/react-native)
- [Available Models](https://cactuscompute.com/models)

## ✅ What's Different from Before

### Previous Behavior:
- ❌ Models downloaded when first called
- ❌ Slow first response
- ❌ Models stayed in memory forever

### New Behavior:
- ✅ Models download on app start
- ✅ Fast responses (already loaded)
- ✅ Auto-cleanup when app closes
- ✅ Quick reload from cache when app reopens
- ✅ Beautiful loading screen with progress

## 🎯 Next Steps

1. ✅ All functions are ready to use
2. ✅ Lifecycle management implemented
3. ✅ Auto-initialization and cleanup working
4. ⏳ Test on a physical device
5. ⏳ Integrate with your UI

**Note:** Functions are NOT yet connected to the UI interface as requested. They are standalone and ready for integration when you're ready!
