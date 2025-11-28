# Testing on Android Phone - Quick Guide

## Option 1: Using Expo Go (Easiest - No Setup Required)

### Step 1: Install Expo Go on Your Android Phone
1. Open **Google Play Store** on your Android phone
2. Search for **"Expo Go"**
3. Install the app

### Step 2: Connect to Same WiFi
- Make sure your **phone** and **computer** are on the **same WiFi network**

### Step 3: Start the Server
On your computer, run:
```bash
npx expo start --clear
```

### Step 4: Scan QR Code
1. Open **Expo Go** app on your phone
2. Tap **"Scan QR Code"**
3. Point your camera at the QR code in your terminal
4. Wait for the app to load

### Step 5: Test the Animation
1. Type a message in the input field
2. Press the send button (arrow up icon)
3. **Watch the emerald gradient animation appear!** 🎉

---

## Option 2: Using ADB (For Development Build)

If you want to build a standalone APK with the latest Reanimated v4:

### Prerequisites
1. **Enable Developer Mode** on your Android phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"

2. **Install Android Studio** (if not already installed):
   - Download from: https://developer.android.com/studio
   - Install Android SDK Platform-Tools

### Step 1: Connect Phone via USB
1. Connect your Android phone to computer with USB cable
2. On your phone, allow USB debugging when prompted

### Step 2: Verify Connection
Open PowerShell and run:
```bash
adb devices
```
You should see your device listed.

### Step 3: Build and Install
```bash
npx expo run:android
```

This will:
- Build the app with native modules (Reanimated v4)
- Install it on your phone
- Launch the app automatically

### Step 4: Test
The app is now installed on your phone! Test the animation by sending a message.

---

## Option 3: Wireless ADB (No USB Cable Needed)

### Step 1: Connect via USB First
```bash
# Connect phone via USB
adb devices

# Get phone's IP address (look for "inet" under wlan0)
adb shell ip addr show wlan0
```

### Step 2: Enable TCP/IP Mode
```bash
adb tcpip 5555
```

### Step 3: Connect Wirelessly
```bash
# Replace with your phone's IP address
adb connect 192.168.1.XXX:5555
```

### Step 4: Disconnect USB
You can now disconnect the USB cable!

### Step 5: Build and Run
```bash
npx expo run:android
```

---

## Troubleshooting

### Issue: "adb is not recognized"
**Solution**: Add Android SDK to your PATH:
1. Find your Android SDK location (usually `C:\Users\YourName\AppData\Local\Android\Sdk`)
2. Add to PATH:
   - `C:\Users\YourName\AppData\Local\Android\Sdk\platform-tools`
   - `C:\Users\YourName\AppData\Local\Android\Sdk\tools`

Or install via Chocolatey:
```bash
choco install adb
```

### Issue: "No devices found"
**Solution**:
1. Make sure USB debugging is enabled
2. Try a different USB cable (some cables are charge-only)
3. On phone, revoke and re-allow USB debugging permissions

### Issue: Build fails
**Solution**:
```bash
# Clean build
cd android
gradlew clean
cd ..

# Rebuild
npx expo run:android
```

### Issue: Metro bundler not connecting
**Solution**:
```bash
# Start Metro manually
npx expo start --clear

# In another terminal, install to phone
npx expo run:android --no-bundler
```

---

## Recommended: Use Expo Go (Option 1)

For quick testing, **Expo Go is the easiest option**:
- ✅ No Android Studio needed
- ✅ No USB cable needed
- ✅ Works over WiFi
- ✅ Instant reload (just shake phone)
- ✅ No build time

Just install Expo Go from Play Store and scan the QR code!

---

## Current Setup Status

Your project is configured for **Expo Go** with:
- ✅ react-native-reanimated v3.16.1 (Expo Go compatible)
- ✅ react-native-svg v15.12.1
- ✅ expo-linear-gradient v15.0.7
- ✅ All animations optimized for mobile

Just scan the QR code and test! 🚀
