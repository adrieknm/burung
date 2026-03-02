# How to Install Flappy Bird on Your Android Smartphone

This is a Progressive Web App (PWA) that can be installed directly on your Android device without going through the Google Play Store.

## Installation Steps:

### Option 1: Install from Chrome Browser (Recommended)

1. **Open Chrome on your Android device**
2. **Navigate to the app URL** (wherever you've hosted the app)
3. **Tap the menu button** (three dots) in the top-right corner
4. **Select "Add to Home screen"** or "Install app"
5. **Confirm the installation** by tapping "Add"
6. **Find the app icon** on your home screen and tap to launch

### Option 2: Install from Vite Dev Server

If you're testing locally:

1. **Make sure your computer and phone are on the same WiFi network**
2. **Find your computer's IP address** (e.g., 192.168.1.100)
3. **On your Android phone, open Chrome**
4. **Navigate to**: `http://YOUR_IP_ADDRESS:5173`
5. **Follow steps 3-6 from Option 1**

### Option 3: Build and Deploy

To deploy the app for production:

1. **Build the app**: `npm run build`
2. **Deploy the `dist` folder** to any web hosting service:
   - Vercel (free): `vercel deploy`
   - Netlify (free): drag and drop the `dist` folder
   - GitHub Pages (free)
   - Firebase Hosting (free)

3. **After deployment**, follow Option 1 steps to install

## Features of This PWA:

- ✅ **Installable** - Works like a native app
- ✅ **Offline capable** - Caches game assets for offline play
- ✅ **Home screen icon** - Appears like a regular app
- ✅ **Full-screen mode** - No browser chrome when running
- ✅ **Responsive** - Works on all screen sizes
- ✅ **Touch controls** - Tap anywhere to fly

## Game Controls:

- **Tap/Click** the game area to make the bird fly
- **Spacebar** on desktop
- Avoid the green pipes and don't hit the ground!

## Troubleshooting:

**"Add to Home screen" option not showing?**
- Make sure you're using Chrome or a Chromium-based browser
- Ensure the PWA is served over HTTPS (required for PWA installation)
- Try reloading the page

**App not working offline?**
- Open the app at least once while online to cache the files
- The service worker will then work offline

**Installation failed?**
- Clear your browser cache and try again
- Make sure all PWA files (manifest.json, service-worker.js) are accessible

## Technical Details:

This PWA includes:
- `manifest.json` - App metadata and icons
- `service-worker.js` - Offline caching and background functionality
- Responsive design for all mobile devices
- Touch-optimized controls

Enjoy playing Flappy Bird on your Android device! 🐦