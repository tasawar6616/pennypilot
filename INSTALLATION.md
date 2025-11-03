# 📦 PennyPilot Installation Guide

This guide will walk you through setting up PennyPilot from scratch.

## Prerequisites

Before you begin, ensure you have:
- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Expo CLI** (will be installed with dependencies)
- **iOS Simulator** (Mac only) or **Android Emulator** or **Physical device with Expo Go**

## Step-by-Step Installation

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/yourusername/pennypilot.git
cd pennypilot
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

Or with yarn:
\`\`\`bash
yarn install
\`\`\`

### 3. Set Up Firebase

#### 3.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name: "PennyPilot" (or your choice)
4. Disable Google Analytics (optional)
5. Click "Create Project"

#### 3.2 Enable Firebase Authentication

1. In Firebase Console, select your project
2. Go to **Build** → **Authentication**
3. Click **"Get Started"**
4. Select **"Email/Password"** sign-in method
5. Toggle **"Enable"** switch to ON
6. Click **"Save"**

#### 3.3 Enable Firestore Database

1. Go to **Build** → **Firestore Database**
2. Click **"Create Database"**
3. Select **"Start in test mode"** (we'll secure it next)
4. Choose your location (closest to your users)
5. Click **"Enable"**

#### 3.4 Get Firebase Configuration

1. In Firebase Console, click the ⚙️ (Settings) icon → **Project settings**
2. Scroll down to **"Your apps"** section
3. Click the **</>** (Web) icon to add a web app
4. Register app with nickname "PennyPilot Web"
5. Copy the `firebaseConfig` object

#### 3.5 Configure Firebase in Your App

Create/Edit `env/firebase.ts` file:

\`\`\`typescript
export const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

export default FIREBASE_CONFIG;
\`\`\`

**IMPORTANT**: Replace all the placeholders with your actual Firebase configuration values!

### 4. Update Firestore Security Rules

1. In Firebase Console → **Firestore Database** → **Rules** tab
2. Replace the existing rules with:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User-specific data - only accessible by the authenticated user
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Deny access to everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
\`\`\`

3. Click **"Publish"**

### 5. Start the Development Server

\`\`\`bash
npx expo start
\`\`\`

### 6. Run on Your Device

Choose one option:

#### Option A: Physical Device (Recommended)
1. Install **Expo Go** from App Store (iOS) or Play Store (Android)
2. Scan the QR code displayed in terminal
3. App will load on your device

#### Option B: iOS Simulator (Mac only)
1. Press `i` in the terminal
2. iOS Simulator will launch automatically

#### Option C: Android Emulator
1. Start Android Emulator first (Android Studio)
2. Press `a` in the terminal
3. App will load in emulator

---

## First Run

### Create Your Account

1. App will launch on the **Login** screen
2. Click **"Don't have an account? Sign Up"**
3. Enter your email address
4. Create a password (minimum 6 characters)
5. Confirm your password
6. Click **"Create Account"**
7. You'll be automatically logged in! 🎉

### Start Tracking

1. You'll see the **Home** screen with your dashboard
2. Default categories and payment methods are automatically created
3. Click **"+ Add Transaction"** or select a category
4. Enter your first expense!

---

## Troubleshooting

### Firebase Errors

#### "auth/configuration-not-found"
- **Solution**: Make sure you enabled Email/Password authentication in Firebase Console

#### "Permission denied" errors
- **Solution**: Verify you published the Firestore security rules correctly

#### "No Firebase App '[DEFAULT]' has been created"
- **Solution**: Check that your Firebase config in `env/firebase.ts` is correct

### App Errors

#### Can't login after registration
- **Solution**: Check Firebase Console → Authentication → Users to verify user was created

#### Data not loading
- **Solution**: 
  - Check internet connection
  - Verify Firebase config
  - Check console logs for errors (use `npx expo start --dev-client`)

#### Port already in use
- **Solution**: Use a different port: `npx expo start --port 8082`

### Platform-Specific Issues

#### iOS: "Unable to resolve module"
\`\`\`bash
cd ios && pod install && cd ..
npx expo start --clear
\`\`\`

#### Android: Build failures
\`\`\`bash
cd android && ./gradlew clean && cd ..
npx expo start --clear
\`\`\`

---

## Environment Variables (Optional)

For better security in production, use environment variables:

1. Install `react-native-dotenv`:
\`\`\`bash
npm install react-native-dotenv
\`\`\`

2. Create `.env` file:
\`\`\`
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
# ... other config
\`\`\`

3. Update `env/firebase.ts` to use environment variables

4. Add `.env` to `.gitignore`

---

## Production Deployment

### Expo Application Services (EAS)

1. Install EAS CLI:
\`\`\`bash
npm install -g eas-cli
\`\`\`

2. Login to Expo:
\`\`\`bash
eas login
\`\`\`

3. Configure EAS:
\`\`\`bash
eas build:configure
\`\`\`

4. Build for iOS:
\`\`\`bash
eas build --platform ios
\`\`\`

5. Build for Android:
\`\`\`bash
eas build --platform android
\`\`\`

See [Expo EAS documentation](https://docs.expo.dev/build/introduction/) for more details.

---

## Support

If you encounter any issues:
1. Check this troubleshooting guide
2. Search existing [GitHub Issues](https://github.com/yourusername/pennypilot/issues)
3. Create a new issue with details about your problem

---

Happy tracking! 💰
