# Multi-Agent Workflow Visualization for React Native

A beautiful, animated multi-agent workflow visualization component for React Native with emerald green gradients, inspired by Apple Intelligence design.

## Features

✨ **Animated Nodes** - Rotating emerald gradient borders when thinking
✨ **Edge Gradient Flow** - Messages flow as emerald green gradients along edges
✨ **Persistent Connections** - Edges stay lit after message completion
✨ **LLM Particles** - Special particle effects for LLM nodes
✨ **Fully Customizable** - Easy to customize colors, nodes, and behavior

## Preview

- 4 LLM Models: Gemma 3, Haiku 4.5, Opus 4.5, Qwen 3
- Aurora coordinator node
- Emerald green gradient color scheme (#C8DC3C → #125B52)
- Smooth animations with React Native Reanimated

## Installation

### Step 1: Install Dependencies

```bash
# Install required packages
npm install react-native-reanimated react-native-svg expo-linear-gradient react-native-safe-area-context

# OR with yarn
yarn add react-native-reanimated react-native-svg expo-linear-gradient react-native-safe-area-context
```

### Step 2: Configure React Native Reanimated

Add the Reanimated plugin to your `babel.config.js`:

```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin', // Must be listed last!
  ],
};
```

### Step 3: iOS Setup (if using iOS)

```bash
cd ios && pod install && cd ..
```

### Step 4: Copy the Components

Copy the entire `react-native` folder to your React Native project:

```
your-project/
├── src/
│   └── components/
│       └── multi-agent-workflow/
│           ├── types.ts
│           ├── MultiAgentWorkflow.tsx
│           ├── NodeComponent.tsx
│           └── ExampleUsage.tsx
```

## Usage

### Basic Usage

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import MultiAgentWorkflow from './components/multi-agent-workflow/MultiAgentWorkflow';
import type { Node, Message } from './components/multi-agent-workflow/types';

export default function App() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'user', label: 'User', type: 'agent', x: 200, y: 300, state: 'idle' },
    { id: 'coordinator', label: 'Aurora', type: 'agent', x: 400, y: 300, state: 'idle' },
    { id: 'llm1', label: 'Gemma 3', type: 'llm', x: 650, y: 150, state: 'idle' },
    { id: 'llm2', label: 'Haiku 4.5', type: 'llm', x: 650, y: 250, state: 'idle' },
  ]);

  const edges = [
    { id: 'e1', from: 'user', to: 'coordinator' },
    { id: 'e2', from: 'coordinator', to: 'llm1' },
    { id: 'e3', from: 'coordinator', to: 'llm2' },
  ];

  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <View style={{ flex: 1 }}>
      <MultiAgentWorkflow nodes={nodes} edges={edges} messages={messages} />
    </View>
  );
}
```

### Full Example with Controls

See [ExampleUsage.tsx](./ExampleUsage.tsx) for a complete example with:
- Message sending functionality
- Node thinking state toggle
- Automated demo sequence
- Control panel UI

### Running the Example

```tsx
import ExampleUsage from './components/multi-agent-workflow/ExampleUsage';

export default function App() {
  return <ExampleUsage />;
}
```

## API Reference

### MultiAgentWorkflow Props

| Prop | Type | Description |
|------|------|-------------|
| `nodes` | `Node[]` | Array of node objects |
| `edges` | `Edge[]` | Array of edge connections |
| `messages` | `Message[]` | Array of active messages |

### Node Interface

```typescript
interface Node {
  id: string;           // Unique identifier
  label: string;        // Display name
  type: 'agent' | 'llm'; // Node type (affects styling)
  x: number;            // X position
  y: number;            // Y position
  state: 'idle' | 'thinking'; // Current state
}
```

### Edge Interface

```typescript
interface Edge {
  id: string;   // Unique identifier
  from: string; // Source node ID
  to: string;   // Target node ID
}
```

### Message Interface

```typescript
interface Message {
  id: string;      // Unique identifier
  from: string;    // Source node ID
  to: string;      // Target node ID
  progress: number; // 0-1 (0% to 100%)
}
```

## Customization

### Changing Colors

Edit the gradient colors in `NodeComponent.tsx`:

```tsx
// Line 87-96 in NodeComponent.tsx
<LinearGradient
  colors={[
    '#C8DC3C', // Yellowish Lime Green
    '#B8D848',
    '#6FBF4C', // Bright Emerald Green
    '#4DB84F',
    '#2A9D5B', // Medium Emerald Green
    '#1F8B5E',
    '#176B58', // Deep Emerald Green
    '#125B52',
    '#C8DC3C',
  ]}
  // ...
/>
```

### Changing Node Size

Edit `NODE_RADIUS` in `NodeComponent.tsx`:

```tsx
const NODE_RADIUS = 30; // Change this value
```

### Changing Edge Colors

Edit the gradient stops in `MultiAgentWorkflow.tsx`:

```tsx
// Line 91-95 in MultiAgentWorkflow.tsx
<LinearGradient id={`gradient-${edgeId}`} x1="0%" y1="0%" x2="100%" y2="0%">
  <Stop offset="0%" stopColor="rgba(42, 157, 91, 0.3)" />
  <Stop offset="50%" stopColor="rgba(111, 191, 76, 0.8)" />
  <Stop offset="100%" stopColor="rgba(42, 157, 91, 0.3)" />
</LinearGradient>
```

## Animation Behavior

### Node States

- **idle**: Gray border, no animations
- **thinking**: Rotating emerald gradient border with glow effect

### LLM Nodes

LLM nodes (`type: 'llm'`) show special particle effects when thinking:
- 3 particles orbit around the node
- Each particle has a different emerald shade
- Smooth fade in/out animation

### Edge Animations

1. Message starts: Gradient begins flowing from source to target
2. Message progresses: Gradient fill extends along the edge
3. Message completes: Edge stays lit with static gradient

### Message Flow

Messages animate their `progress` from 0 to 1:

```typescript
// Example: Animate a message over 2 seconds
const sendMessage = (from: string, to: string) => {
  const newMessage = { id: 'msg1', from, to, progress: 0 };
  setMessages([...messages, newMessage]);

  let progress = 0;
  const interval = setInterval(() => {
    progress += 0.02;
    if (progress >= 1) {
      clearInterval(interval);
      // Remove message when complete
      setMessages(prev => prev.filter(m => m.id !== 'msg1'));
    } else {
      setMessages(prev =>
        prev.map(m => m.id === 'msg1' ? { ...m, progress } : m)
      );
    }
  }, 30);
};
```

## Troubleshooting

### Animations not working

Make sure Reanimated plugin is added to `babel.config.js` and is **listed last**.

### Gradients not showing

Ensure `expo-linear-gradient` is installed:
```bash
npm install expo-linear-gradient
```

### SVG issues

Check that `react-native-svg` is properly installed and linked:
```bash
npm install react-native-svg
cd ios && pod install # iOS only
```

### Type errors

Make sure TypeScript is configured and the `types.ts` file is imported correctly.

## Performance Tips

1. **Limit active messages**: Keep the number of simultaneous messages under 10
2. **Optimize node count**: Performance is best with under 20 nodes
3. **Use production builds**: Animations are much smoother in release builds

## Dependencies

- **react-native-reanimated**: ^3.6.0 - For smooth animations
- **react-native-svg**: ^14.0.0 - For SVG rendering
- **expo-linear-gradient**: ^12.5.0 - For gradient effects
- **react-native-safe-area-context**: ^4.8.0 - For safe area handling

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ for React Native**
