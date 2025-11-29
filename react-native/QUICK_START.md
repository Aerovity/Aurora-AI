# Quick Start: Integrated Multi-Agent Workflow

Your multi-agent workflow animation is now **fully integrated** into your App.tsx!

## ✅ What's Been Implemented

### 1. SimpleWorkflow Component
- **Auto-triggers** when user sends a message
- **2 nodes**: User and Aurora AI
- **Aurora AI is always thinking** (rotating emerald gradient forever)
- **Edge animation** flows from User → Aurora when message is sent
- **Phone-optimized** positioning (responsive to screen size)

### 2. Integration with App.tsx
The workflow animation now:
- Replaces the old GraphAnimation component
- Shows automatically when user sends a message
- Displays below the user's message in the chat
- Uses the beautiful emerald gradient design

## 🚀 Installation

### Step 1: Install Dependencies

```bash
npm install react-native-reanimated@^3.6.0 react-native-svg@^14.0.0 expo-linear-gradient@^12.5.0 react-native-safe-area-context@^4.8.0
```

### Step 2: Configure Babel

Add to `babel.config.js` (must be last):

```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin', // MUST be last!
  ],
};
```

### Step 3: Clear Cache & Run

```bash
# Clear Metro cache
npm start -- --reset-cache

# For iOS
cd ios && pod install && cd ..
npm run ios

# For Android
npm run android
```

## 📱 How It Works

### User Flow:
1. User types a message and presses send
2. Message appears in chat
3. **Workflow animation appears below the message**
4. Edge animates from User node → Aurora AI node (1.5s)
5. Aurora AI node is always in "thinking" state with:
   - Rotating emerald gradient border (3s rotation)
   - Glowing effect
   - Smooth scale animation

### Technical Flow:
```tsx
handleSubmit()
  → setMessages([...messages, userMessage])
  → setShowGraph(true)
  → setTriggerWorkflow(true)
  → SimpleWorkflow receives trigger
  → sendMessage('user', 'aurora')
  → Edge gradient flows 0% → 100%
  → Edge stays lit permanently
```

## 🎨 Visual Details

### Aurora AI Node (Always Thinking):
- **Size**: 60px diameter (30px radius)
- **Border**: Rotating 8-color emerald gradient
- **Rotation**: 360° every 3 seconds
- **Glow**: Emerald shadow effect
- **Scale**: 1.1x when thinking (always)

### Edge Animation:
- **Base**: White line (rgba(255, 255, 255, 0.2))
- **Gradient Overlay**: Emerald green gradient
  - Start: rgba(42, 157, 91, 0.3)
  - Middle: rgba(111, 191, 76, 0.8)
  - End: rgba(42, 157, 91, 0.3)
- **Duration**: 1.5 seconds
- **Persistence**: Stays lit forever after completion

### Responsive Positioning:
```typescript
// Mobile (width < 768px)
User: x=30% of screen, y=40% of container
Aurora: x=70% of screen, y=40% of container

// Tablet/larger
User: x=35% of screen, y=50% of container
Aurora: x=65% of screen, y=50% of container
```

## 🔧 Customization

### Change Animation Height
In `SimpleWorkflow.tsx`:
```tsx
const styles = StyleSheet.create({
  container: {
    height: 200, // Change this value
  },
});
```

### Change Node Labels
In `SimpleWorkflow.tsx`:
```tsx
const [nodes, setNodes] = useState<Node[]>([
  {
    id: 'user',
    label: 'You', // Change this
    type: 'agent',
    x: positions.userX,
    y: positions.userY,
    state: 'idle',
  },
  {
    id: 'aurora',
    label: 'AI Assistant', // Change this
    type: 'agent',
    x: positions.auroraX,
    y: positions.auroraY,
    state: 'thinking',
  },
]);
```

### Change Colors
Edit colors in `NodeComponent.tsx`:
```tsx
// Line 118-127: Emerald gradient colors
colors={[
  '#C8DC3C', // Change these
  '#B8D848',
  '#6FBF4C',
  // ... etc
]}
```

### Make Aurora Stop Thinking
In `SimpleWorkflow.tsx`:
```tsx
{
  id: 'aurora',
  label: 'Aurora AI',
  type: 'agent',
  x: positions.auroraX,
  y: positions.auroraY,
  state: 'idle', // Change from 'thinking' to 'idle'
}
```

## 🎯 What's Different from Full Example

### SimpleWorkflow vs ExampleUsage:

| Feature | SimpleWorkflow | ExampleUsage |
|---------|---------------|--------------|
| Nodes | 2 (User, Aurora) | 6 (User, Aurora, 4 LLMs) |
| Controls | No UI controls | Full control panel |
| Auto-trigger | Yes (on message) | Manual buttons |
| Aurora state | Always thinking | Toggleable |
| Size | Compact (200px) | Full screen |
| Use case | Chat integration | Demo/showcase |

## 🐛 Troubleshooting

### Animation not showing
- Check that `showGraph` is true
- Verify `triggerWorkflow` is being set
- Look for console errors about missing dependencies

### Nodes cut off on screen
- Adjust container height in SimpleWorkflow.tsx
- Check node positions in `getNodePositions()`

### Gradient not rotating
- Ensure `react-native-reanimated` plugin is in babel.config.js
- Try clearing Metro cache: `npm start -- --reset-cache`

### Edge not animating
- Verify `react-native-svg` is installed
- Check that message progress is updating (0 → 1)

## 📊 File Structure

```
App.tsx                           # Main app (integrated)
react-native/
├── SimpleWorkflow.tsx            # ⭐ Auto-triggering workflow
├── MultiAgentWorkflow.tsx        # Core rendering component
├── NodeComponent.tsx             # Animated nodes
├── ExampleUsage.tsx              # Full demo with controls
├── types.ts                      # TypeScript interfaces
└── index.ts                      # Exports
```

## 🎉 You're All Set!

The workflow animation is now integrated and will:
- ✅ Show automatically when user sends a message
- ✅ Display beautiful emerald gradient animations
- ✅ Work on all phone sizes (responsive)
- ✅ Run smoothly at 60fps

Just install the dependencies, configure Babel, and run your app!

---

**Need more nodes?** See [ExampleUsage.tsx](ExampleUsage.tsx) for the full 6-node demo with 4 LLMs.

**Need customization?** Check [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for advanced options.
