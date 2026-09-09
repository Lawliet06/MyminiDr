# 🩺 MyMiniDr — AI-Powered Personal Health Assistant

[![React Native](https://img.shields.io/badge/React%20Native-v0.73-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-v50-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-3.x%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-v10-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

**MyMiniDr** is a cross-platform (Web, Android, iOS) AI-powered personal health companion built with **React Native** and **Expo**. It empowers users to ask medical questions, analyze symptom descriptions, inspect prescription/lab photos via OCR & multimodal vision, and maintain private, encrypted medical chat histories.

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🏗️ System Architecture & Tech Stack](#️-system-architecture--tech-stack)
- [📂 Project Structure](#-project-structure)
- [⚡ Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables Setup](#environment-variables-setup)
- [🚀 Running the App](#-running-the-app)
  - [Web Version](#web-version)
  - [Android Version](#android-version)
  - [iOS Version](#ios-version)
- [🧠 AI & Vision Engine](#-ai--vision-engine)
  - [Multi-Model Fallback System](#multi-model-fallback-system)
  - [Prescription & Image OCR Analysis](#prescription--image-ocr-analysis)
- [🔐 Security & Data Privacy](#-security--data-privacy)
  - [End-to-End Payload Encryption](#end-to-end-payload-encryption)
- [🌐 Web Hosting & Deployment](#-web-hosting--deployment)
  - [Deploying to Vercel (Recommended)](#deploying-to-vercel-recommended)
  - [Firebase Authorized Domains](#firebase-authorized-domains)
- [⚠️ Medical Disclaimer](#️-medical-disclaimer)

---

## ✨ Features

- **🤖 Intelligent Health Consultations**: Instant, context-aware responses powered by Google Gemini AI with medical guidance prompts.
- **📸 Multimodal & Vision Capabilities**: Attach photos of prescriptions, medicine packaging, lab test results, or visible symptoms for automated OCR and AI visual breakdown.
- **🛡️ Silent AI Failover**: Automatic fallback across multiple Gemini models (`gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-3.7-flash`, and lite tiers) whenever rate limits or high-demand errors occur.
- **🔒 AES-256 Chat Encryption**: Chat messages are encrypted client-side using user-specific keys before being stored in Firestore, safeguarding personal health data.
- **📜 Smart Chat History**: Recent conversations sorted newest-first with instant resume, custom chat titles, and cloud synchronization.
- **👤 Guest Mode & Account Support**: Use the app instantly as a guest (offline local storage) or authenticate via Email/Password or Google Sign-In for multi-device sync.
- **📱 True Cross-Platform UI**: Responsive layout optimized for both desktop web browsers and native Android/iOS mobile devices.

---

## 🏗️ System Architecture & Tech Stack

| Domain | Technology / Library | Description |
| :--- | :--- | :--- |
| **Framework** | [React Native](https://reactnative.dev/) / [Expo SDK 50](https://expo.dev/) | Cross-platform mobile and web application framework |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) | File-based navigation system |
| **AI Intelligence** | [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) | Google Gemini SDK for multimodal generative intelligence |
| **Vision / OCR** | [Google Cloud Vision API](https://cloud.google.com/vision) | Text extraction and image annotation for medical documents |
| **Backend & Auth** | [Firebase](https://firebase.google.com/) (Auth & Firestore) | User authentication, cloud database, and profile storage |
| **Encryption** | [CryptoJS](https://cryptojs.gitbook.io/docs/) | Client-side AES-256 encryption for chat payloads |
| **Storage** | [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) | Offline persistence for guest mode and cached tokens |
| **Styling & Assets**| React Native StyleSheet, `@expo/vector-icons`, Lottie | Modern, sleek medical-themed user interface |

---

## 📂 Project Structure

```
MyminiDr/
├── .env                  # Local environment secrets (IGNORED BY GIT)
├── .env.example          # Template for required environment variables
├── Firebaseconfig.js     # Firebase client initialization using env vars
├── vercel.json           # Vercel deployment configuration
├── app/                  # Expo Router pages
│   ├── index.js          # App entry point & auth state router
│   ├── Welcome.js        # Onboarding / Landing screen
│   ├── Home.js           # Dashboard, chat history, and navigation drawer
│   ├── NavLogin.js       # Route wrapper for Login
│   ├── NavSignUp.js      # Route wrapper for Sign Up
│   └── NavChat.js        # Route wrapper for Chat
├── Screens/              # Screen components
│   ├── ChatScreen.js     # Main AI consultation chat interface with Gemini & Vision
│   ├── LoginScreen.js    # Sign-in UI & validation
│   └── SignUpScreen.js   # Account registration UI
├── components/           # Reusable UI components
│   ├── CustomButton.js   # Styled action button
│   ├── InputField.js     # Form input wrapper with validation
│   └── LogOutButton.js   # Secure sign-out trigger
├── services/             # Core business logic & utility modules
│   └── encryption.js     # AES-256 encryption/decryption routines
├── assets/               # Images, icons, and Lottie animations
├── android/              # Native Android project configuration
└── package.json          # Project dependencies and npm scripts
```

---

## ⚡ Getting Started

### Prerequisites

Make sure you have installed:
- [Node.js (LTS version >= 18)](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/more/expo-cli/): `npm install -g expo-cli`
- *(For mobile development)* [Android Studio](https://developer.android.com/studio) or [Xcode](https://developer.apple.com/xcode/) / [Expo Go](https://expo.dev/go)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/MyminiDr.git
   cd MyminiDr
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

### Environment Variables Setup

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Fill in your API keys in `.env`:

```env
# Google Gemini AI API Key (From Google AI Studio)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Google Cloud Vision API Key (For prescription OCR)
EXPO_PUBLIC_VISION_API_KEY=your_vision_api_key_here

# Firebase Web App Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> [!IMPORTANT]
> In Expo, environment variables accessible in the client JavaScript bundle **must** be prefixed with `EXPO_PUBLIC_`. Never commit your real `.env` file to source control.

---

## 🚀 Running the App

### Web Version
Launch the interactive web development server:
```bash
npm run web
# Or: npx expo start --web
```
Open your browser at `http://localhost:8081` (or the port indicated in the terminal).

### Android Version
```bash
# Start development server
npm start

# Run on connected Android device/emulator
npm run android
```
*Or scan the QR code displayed in the terminal using the **Expo Go** app on your Android phone.*

### iOS Version
```bash
npm run ios
```
*Or scan the QR code with the iOS Camera app to launch in **Expo Go**.*

---

## 🧠 AI & Vision Engine

### Multi-Model Fallback System
To ensure uninterrupted service when an AI model experiences peak load (HTTP `429`, `503`, or `RESOURCE_EXHAUSTED`), `ChatScreen.js` implements an automated, silent failover mechanism across a prioritized list of models:

```
┌───────────────────────────┐
│     gemini-3.6-flash      │ ── (Overloaded / Quota Exceeded?)
└─────────────┬─────────────┘
              ▼
┌───────────────────────────┐
│     gemini-3.5-flash      │ ── (Overloaded / Quota Exceeded?)
└─────────────┬─────────────┘
              ▼
┌───────────────────────────┐
│     gemini-3.7-flash      │ ── (Overloaded / Quota Exceeded?)
└─────────────┬─────────────┘
              ▼
┌───────────────────────────┐
│   gemini-3.5-flash-lite   │ ──► Success / Fallback Response
└───────────────────────────┘
```

### Prescription & Image OCR Analysis
When an image is attached:
1. The image is converted into base64 payload.
2. Google Cloud Vision API extracts raw text (OCR) from prescription labels or medical reports.
3. The extracted text and visual image data are passed to the Gemini Multimodal model with medical interpretation context.

---

## 🔐 Security & Data Privacy

### End-to-End Payload Encryption
Personal health details require strict confidentiality. MyMiniDr integrates **AES-256** encryption in [services/encryption.js](file:///c:/Users/User/Documents/MyminiDrV0/MyminiDr/services/encryption.js):

- **Encrypted in Transit & At Rest**: Only encrypted ciphertext (`encryptedPayload`) is stored in Firestore documents.
- **User-Key Derivation**: The encryption key is dynamically derived using the authenticated user's unique credentials.
- **Plain Display Titles**: Chat titles remain unencrypted for fast indexing and sidebar listing, while full message bodies remain encrypted.

---

## 🌐 Web Hosting & Deployment

### Deploying to Vercel (Recommended)

1. **Static Export Build**:
   ```bash
   npx expo export --platform web
   ```
2. **Deploy with Vercel CLI**:
   ```bash
   # Install CLI (one time)
   npm install -g vercel

   # Deploy to production
   vercel --prod
   ```
3. **Or Deploy via GitHub**:
   - Push your repository to GitHub.
   - Import the repository in [Vercel Dashboard](https://vercel.com).
   - In **Project Settings > Environment Variables**, paste all keys from your `.env` file.
   - Deployments will trigger automatically on every `git push`.

### Firebase Authorized Domains
After deploying your web app:
1. Go to the [Firebase Console](https://console.firebase.google.com/) > **Authentication** > **Settings** > **Authorized Domains**.
2. Add your deployment URL (e.g., `myminidr.vercel.app`).

---

## ⚠️ Medical Disclaimer

> [!WARNING]
> **MyMiniDr is an AI-powered assistant designed for informational and educational purposes only.**
> It is **not** a substitute for professional medical advice, clinical diagnosis, or treatment. Always consult a qualified healthcare provider with any questions regarding medical conditions or prescriptions. In case of an emergency, contact your local emergency services immediately.