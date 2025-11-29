# Adaptive Chat - React Native Version

This is the React Native version of the Adaptive Chat application, built with Expo.

## 🎯 What's Different from Web Version?

### React Native Components
- Uses `<View>` instead of `<div>`
- Uses `<Text>` instead of `<span>`, `<p>`, `<h1>`, etc.
- Uses `<TouchableOpacity>` instead of `<button>` or `<a>`
- Uses `<TextInput>` instead of `<input>`
- Uses `<ImageBackground>` and `<Image>` from Expo
- Uses StyleSheet API for styling (JavaScript objects, not CSS)

### Key Features Implemented
✅ Background image with gradient (bgada.png)
✅ Logo (aurora_logo.png)
✅ Responsive header with icons on mobile
✅ Navigation (Home, Usage, Models, Pricing)
✅ **Lucide SVG icons** (same as web version!)
✅ GitHub star counter
✅ Typewriter animation for placeholder text
✅ Emerald color theme throughout
✅ Multi-line chat input
✅ Message display
✅ Keyboard handling for mobile
✅ Blur effects for header and input

## 📱 How to Run

### Prerequisites
- Node.js installed
- Expo Go app on your phone (iOS or Android)

### Installation & Running

1. **Install dependencies** (already done):
   ```bash
   cd reactnativeversion
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on your device**:
   - **iOS**: Press `i` in terminal, or scan QR code with Camera app
   - **Android**: Press `a` in terminal, or scan QR code with Expo Go app
   - **Web**: Press `w` in terminal (works as web app too!)

## 📂 Project Structure

```
reactnativeversion/
├── App.tsx                 # Main app component
├── assets/
│   └── images/
│       ├── bgada.png      # Background gradient image
│       └── aurora_logo.png # Logo
├── package.json
└── README_REACT_NATIVE.md
```

## 🎨 Styling Differences

### Web (CSS/Tailwind):
```jsx
<div className="flex items-center gap-4 bg-emerald-400">
```

### React Native (StyleSheet):
```jsx
<View style={styles.container}>

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#34d399',
  }
});
```

## 🔄 Key Conversions Made

| Web React | React Native |
|-----------|-------------|
| `<div>` | `<View>` |
| `<span>`, `<p>`, `<h1>` | `<Text>` |
| `<button>`, `<a>` | `<TouchableOpacity>` |
| `<input>`, `<textarea>` | `<TextInput>` |
| `<img>` | `<Image>` |
| CSS classes | StyleSheet objects |
| onClick | onPress |
| onChange | onChangeText |

## 📦 Dependencies Used

- **expo**: Framework for React Native
- **expo-linear-gradient**: Gradient backgrounds
- **expo-blur**: Blur effects for header/input
- **expo-image**: Optimized image component
- **lucide-react-native**: SVG icons (same as web version)
- **react-native**: Core framework

## 🚀 Building for Production

### iOS:
```bash
eas build --platform ios
```

### Android:
```bash
eas build --platform android
```

(Requires Expo EAS account - sign up at expo.dev)

## 🎯 Features

- ✅ Emerald/lime color theme matching web version
- ✅ Responsive design (adapts to phone/tablet)
- ✅ Typewriter placeholder animation
- ✅ GitHub star integration
- ✅ Icon navigation on mobile
- ✅ Blur effects (header & input)
- ✅ Multi-line text input
- ✅ Message history
- ✅ Keyboard avoidance

## 📝 Notes

- **Icons**: Now uses Lucide React Native (same SVG icons as web version!)
- The tubelight navbar effect from web version isn't included (complex CSS animations don't translate to React Native)
- Chat functionality is basic (messages stored locally, no API integration yet)
- Runs on iOS, Android, and Web!

## 🔗 Web Version

The original Next.js web version is in:
```
../chatbot-theme-customization/
```

Both versions share the same design language and color scheme!
