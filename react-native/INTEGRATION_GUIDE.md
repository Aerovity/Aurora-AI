# Integration Guide: Multi-Agent Workflow Animation

This guide will help you integrate the multi-agent workflow animation into your existing React Native app.

## Prerequisites

Make sure you have the following dependencies installed in your main project:

```bash
npm install react-native-reanimated@^3.6.0 react-native-svg@^14.0.0 expo-linear-gradient@^12.5.0 react-native-safe-area-context@^4.8.0
```

## Step 1: Configure React Native Reanimated

Add the Reanimated plugin to your `babel.config.js` (MUST be the last plugin):

```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin', // MUST be listed last!
  ],
};
```

## Step 2: Integration into App.tsx

You have two options for integration:

### Option A: Replace the Existing Graph Animation

Replace the current `GraphAnimation` component in your App.tsx with the new multi-agent workflow:

```tsx
// At the top of App.tsx, add:
import { MultiAgentWorkflow } from './react-native';
import type { Node, Edge, Message } from './react-native/types';

// Replace GraphAnimation component with workflow state:
const [workflowNodes, setWorkflowNodes] = useState<Node[]>([
  { id: 'user', label: 'User', type: 'agent', x: 100, y: 300, state: 'idle' },
  { id: 'aurora', label: 'Aurora', type: 'agent', x: 300, y: 300, state: 'idle' },
]);

const workflowEdges: Edge[] = [
  { id: 'e1', from: 'user', to: 'aurora' },
];

const [workflowMessages, setWorkflowMessages] = useState<Message[]>([]);

// In the handleSubmit function, replace the graph animation code with:
const handleSubmit = () => {
  if (inputValue.trim()) {
    setMessages([...messages, { role: 'user', text: inputValue }]);
    setInputValue('');

    // Start Aurora thinking
    setWorkflowNodes(prev => prev.map(n =>
      n.id === 'aurora' ? { ...n, state: 'thinking' } : n
    ));

    // Send message from user to aurora
    const msgId = `msg-${Date.now()}`;
    const newMessage: Message = {
      id: msgId,
      from: 'user',
      to: 'aurora',
      progress: 0,
    };
    setWorkflowMessages([newMessage]);

    // Animate message progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.02;
      if (progress >= 1) {
        clearInterval(interval);
        setWorkflowMessages([]);
        // Stop Aurora thinking after 2 seconds
        setTimeout(() => {
          setWorkflowNodes(prev => prev.map(n =>
            n.id === 'aurora' ? { ...n, state: 'idle' } : n
          ));
        }, 2000);
      } else {
        setWorkflowMessages([{ ...newMessage, progress }]);
      }
    }, 30);
  }
};

// Replace the GraphAnimation render with:
{showGraph && (
  <View style={{ height: 200, width: '100%' }}>
    <MultiAgentWorkflow
      nodes={workflowNodes}
      edges={workflowEdges}
      messages={workflowMessages}
    />
  </View>
)}
```

### Option B: Create a New Screen/Modal

Create a separate full-screen animation that shows when the user sends a message:

```tsx
import { Modal } from 'react-native';
import { ExampleUsage } from './react-native';

// Add state for modal
const [showWorkflow, setShowWorkflow] = useState(false);

// Add button to show workflow
<TouchableOpacity
  style={styles.workflowButton}
  onPress={() => setShowWorkflow(true)}
>
  <Text style={styles.buttonText}>View Workflow</Text>
</TouchableOpacity>

// Add modal
<Modal visible={showWorkflow} animationType="slide">
  <ExampleUsage />
  <TouchableOpacity
    style={styles.closeButton}
    onPress={() => setShowWorkflow(false)}
  >
    <Text>Close</Text>
  </TouchableOpacity>
</Modal>
```

## Step 3: Customizing Node Positions

Adjust node positions based on your screen size:

```tsx
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const nodes: Node[] = [
  {
    id: 'user',
    label: 'User',
    type: 'agent',
    x: width * 0.25, // 25% from left
    y: height * 0.5,  // Center vertically
    state: 'idle'
  },
  {
    id: 'aurora',
    label: 'Aurora',
    type: 'agent',
    x: width * 0.75, // 75% from left
    y: height * 0.5,
    state: 'idle'
  },
  // Add more nodes for LLMs
  {
    id: 'llm1',
    label: 'Gemma 3',
    type: 'llm',
    x: width * 0.75,
    y: height * 0.3,
    state: 'idle'
  },
];
```

## Step 4: Running the App

1. **Clear Metro cache**:
```bash
npm start -- --reset-cache
```

2. **For iOS**:
```bash
cd ios && pod install && cd ..
npm run ios
```

3. **For Android**:
```bash
npm run android
```

## Common Issues

### Issue: Animations not smooth
**Solution**: Make sure you're running a release build for best performance:
```bash
npm run android -- --variant=release
npm run ios -- --configuration Release
```

### Issue: Gradients not appearing
**Solution**: Verify `expo-linear-gradient` is installed:
```bash
npm list expo-linear-gradient
```

### Issue: TypeScript errors
**Solution**: Make sure paths are correct in your imports:
```tsx
import { MultiAgentWorkflow } from './react-native';
// OR
import { MultiAgentWorkflow } from '../react-native';
// Adjust path based on your folder structure
```

### Issue: Reanimated errors
**Solution**:
1. Restart Metro bundler
2. Clear build folders:
```bash
# iOS
rm -rf ios/build
cd ios && pod install && cd ..

# Android
cd android && ./gradlew clean && cd ..
```

## Full Example with 4 LLMs

```tsx
import React, { useState } from 'react';
import { View, Dimensions } from 'react-native';
import { MultiAgentWorkflow } from './react-native';
import type { Node, Edge, Message } from './react-native/types';

const { width, height } = Dimensions.get('window');

export default function WorkflowDemo() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'user', label: 'User', type: 'agent', x: width * 0.2, y: height * 0.5, state: 'idle' },
    { id: 'aurora', label: 'Aurora', type: 'agent', x: width * 0.5, y: height * 0.5, state: 'idle' },
    { id: 'llm1', label: 'Gemma 3', type: 'llm', x: width * 0.8, y: height * 0.25, state: 'idle' },
    { id: 'llm2', label: 'Haiku 4.5', type: 'llm', x: width * 0.8, y: height * 0.4, state: 'idle' },
    { id: 'llm3', label: 'Opus 4.5', type: 'llm', x: width * 0.8, y: height * 0.6, state: 'idle' },
    { id: 'llm4', label: 'Qwen 3', type: 'llm', x: width * 0.8, y: height * 0.75, state: 'idle' },
  ]);

  const edges: Edge[] = [
    { id: 'e1', from: 'user', to: 'aurora' },
    { id: 'e2', from: 'aurora', to: 'llm1' },
    { id: 'e3', from: 'aurora', to: 'llm2' },
    { id: 'e4', from: 'aurora', to: 'llm3' },
    { id: 'e5', from: 'aurora', to: 'llm4' },
  ];

  const [messages, setMessages] = useState<Message[]>([]);

  const runDemo = () => {
    // Reset
    setNodes(prev => prev.map(n => ({ ...n, state: 'idle' })));
    setMessages([]);

    // User → Aurora
    setTimeout(() => sendMessage('user', 'aurora'), 500);

    // Aurora starts thinking
    setTimeout(() => toggleThinking('aurora'), 1500);

    // Aurora sends to all LLMs
    setTimeout(() => {
      toggleThinking('aurora');
      sendMessage('aurora', 'llm1');
      setTimeout(() => sendMessage('aurora', 'llm2'), 100);
      setTimeout(() => sendMessage('aurora', 'llm3'), 200);
      setTimeout(() => sendMessage('aurora', 'llm4'), 300);
    }, 3000);

    // LLMs start thinking
    setTimeout(() => {
      toggleThinking('llm1');
      toggleThinking('llm2');
      toggleThinking('llm3');
      toggleThinking('llm4');
    }, 4000);

    // LLMs finish at different times
    setTimeout(() => toggleThinking('llm1'), 6000);
    setTimeout(() => toggleThinking('llm2'), 6500);
    setTimeout(() => toggleThinking('llm3'), 7000);
    setTimeout(() => toggleThinking('llm4'), 7500);
  };

  const sendMessage = (from: string, to: string) => {
    const msgId = `msg-${Date.now()}-${Math.random()}`;
    const newMsg: Message = { id: msgId, from, to, progress: 0 };
    setMessages(prev => [...prev, newMsg]);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.02;
      if (progress >= 1) {
        clearInterval(interval);
        setMessages(prev => prev.filter(m => m.id !== msgId));
      } else {
        setMessages(prev => prev.map(m =>
          m.id === msgId ? { ...m, progress } : m
        ));
      }
    }, 30);
  };

  const toggleThinking = (nodeId: string) => {
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, state: n.state === 'thinking' ? 'idle' : 'thinking' } : n
    ));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <MultiAgentWorkflow nodes={nodes} edges={edges} messages={messages} />

      {/* Add controls as needed */}
    </View>
  );
}
```

## Performance Optimization

For best performance:

1. **Limit simultaneous messages** to < 10
2. **Use fewer nodes** for mobile (< 15 recommended)
3. **Test on release builds** not debug builds
4. **Consider using useMemo** for node/edge calculations:

```tsx
const nodes = useMemo(() => [
  { id: 'user', label: 'User', type: 'agent', x: 200, y: 300, state: 'idle' },
  // ... other nodes
], []);
```

## Next Steps

- Customize colors in [NodeComponent.tsx](NodeComponent.tsx)
- Adjust animations in [MultiAgentWorkflow.tsx](MultiAgentWorkflow.tsx)
- Add your own nodes and edges
- Integrate with your backend API

Enjoy your animated multi-agent workflow! 🎉
