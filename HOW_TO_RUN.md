# How to Run on Your Android Phone

## Prerequisites

1. **Enable Developer Options on your phone:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Developer Options will be enabled

2. **Enable USB Debugging:**
   - Go to Settings → Developer Options
   - Turn on "USB Debugging"

3. **Connect your phone:**
   - Connect your Android phone to your computer via USB cable
   - When prompted on your phone, allow "USB Debugging"

## Method 1: Build and Run (Recommended for First Time)

This builds a custom development client with all native modules included.

### Step 1: Check Your Phone is Connected

```bash
npx expo run:android --device
```

This will:
- List all connected devices
- Build the app with native modules (Cactus SDK)
- Install it on your phone
- Start the Metro bundler

**First build takes 5-10 minutes** (it's compiling native code).

### Step 2: Wait for Build to Complete

You'll see:
```
> Building...
> Installing the app...
> Starting Metro bundler...
```

The app will automatically open on your phone!

### Step 3: See the Magic! ✨

You'll see:
1. **Loading screen** with your video
2. **Progress bars** showing model downloads (Qwen & Gemma)
3. **Main app** once models are ready

**First launch:** Models download (~1.6GB) - takes 2-5 minutes depending on internet
**Subsequent launches:** Models load from cache in 2-3 seconds!

## Method 2: Development Server (After First Build)

Once you've built the app once, you can use the faster development workflow:

```bash
# Start the dev server
npx expo start --dev-client
```

Then press `a` to open on Android, or scan the QR code with Expo Go Dev Client.

## Troubleshooting

### "No devices found"

**Check connection:**
```bash
adb devices
```

You should see your device listed. If not:
- Reconnect USB cable
- Check USB debugging is enabled
- Try a different USB cable
- Install/update Android USB drivers on Windows

### "Build failed"

Make sure you have:
- Android Studio installed
- Android SDK configured
- Java JDK installed

**Install Android Studio:**
https://developer.android.com/studio

### "Metro bundler won't start"

```bash
# Clear Metro cache
npx expo start --clear

# Or rebuild
npx expo run:android --device
```

### App crashes on launch

This means native modules aren't built. Run:
```bash
npx expo run:android --device
```

DO NOT use `npx expo start` alone (opens Expo Go, which won't work).

## Quick Reference

| Command | When to Use |
|---------|-------------|
| `npx expo run:android --device` | First time, or after changing native code |
| `npx expo start --dev-client` | Daily development (after first build) |
| `adb devices` | Check if phone is connected |
| `npx expo start --clear` | Clear cache if having issues |

## Expected Timeline

**First Launch:**
1. Build app: 5-10 minutes
2. Install on phone: 30 seconds
3. Download models: 2-5 minutes (first time only)
4. **Total: ~15 minutes first time**

**Subsequent Launches:**
1. Open app: instant
2. Load models from cache: 2-3 seconds
3. **Total: 3 seconds!**

## What You'll See

```
┌─────────────────────────────────┐
│  Phone Screen                    │
├─────────────────────────────────┤
│                                  │
│  [Loading Video Background]     │
│                                  │
│  ╔══════════════════════════╗  │
│  ║ Loading AI Models         ║  │
│  ║                          ║  │
│  ║ Overall Progress    45%  ║  │
│  ║ ████████░░░░░░░░░░       ║  │
│  ║                          ║  │
│  ║ Qwen 0.5B    50%         ║  │
│  ║ ██████████░░░░░░         ║  │
│  ║                          ║  │
│  ║ Gemma 1B     40%         ║  │
│  ║ ████████░░░░░░░░         ║  │
│  ║                          ║  │
│  ║ Downloading models...    ║  │
│  ╚══════════════════════════╝  │
│                                  │
└─────────────────────────────────┘
```

Once models are loaded, you'll see your main Aurora AI interface!

## Ready to Start?

Run this command now:

```bash
npx expo run:android --device
```

Then grab a coffee ☕ and wait for the build to complete!

---

**Need help?** Check the troubleshooting section above or let me know what error you see.
