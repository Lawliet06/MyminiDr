# MyminiDr: Web, Mobile, & Installation Guide

This guide explains how to run **MyminiDr** in a **Web Browser**, how to test it live on an **Android Phone via Expo Go**, and how to build a **standalone installable Android APK** that can be installed on any Android phone.

---

## 🚀 1. Running in Web Browser (Easiest & Fastest)

You can now run and use MyminiDr directly in your desktop or mobile web browser.

### Steps:
1. Open your terminal in the project directory:
   ```bash
   cd c:\Users\User\Documents\MyminiDrV0\MyminiDr
   ```
2. Start the web development server:
   ```bash
   npm run web
   ```
   *(or run `npx expo start --web`)*
3. The app will automatically open in your default browser at:
   ```
   http://localhost:8081
   ```

### Web Features Included:
- **Instant Guest Mode**: Click *"Continue as Guest (No Sign Up)"* to chat with Dr. Tico immediately.
- **Web Social Authentication**: Web popup sign-in for Google and Facebook accounts.
- **Cross-Platform File Upload**: Direct image uploads from your computer or phone browser.
- **Field-Level AES Encryption**: All chat conversations and sensitive dates are encrypted before sending to the database.

---

## 📱 2. Running on Android Phone via Expo Go (Virtual / Live Preview)

The **Expo Go** app allows you to preview and interact with the app on an Android device in real-time with live hot-reloading.

### Steps:
1. **Install Expo Go** on your Android phone from the **Google Play Store**:
   - Search for **Expo Go** and install it.
2. **Connect to Same Network**:
   - Ensure your computer and Android phone are connected to the **same Wi-Fi network**.
   - *(If on different networks or behind a strict firewall, use tunnel mode: `npx expo start --tunnel`)*
3. **Start the Expo Server**:
   ```bash
   npx expo start
   ```
4. **Scan the QR Code**:
   - Open the **Expo Go** app on your Android phone.
   - Tap **Scan QR Code** and scan the QR code printed in your computer terminal.
   - The app will download the JavaScript bundle and launch Dr. Tico on your phone.

---

## 📦 3. Building & Installing a Standalone Android APK (Direct Phone Install)

If you want a **regular Android app (`.apk`)** that can be installed on any Android phone without needing Expo Go or development tools:

### Step 1: Install EAS CLI (Expo Application Services)
If not already installed globally:
```bash
npm install -g eas-cli
```

### Step 2: Log in to your Expo account
```bash
eas login
```
*(If you don't have an Expo account yet, create one for free at [expo.dev](https://expo.dev/signup))*

### Step 3: Trigger the APK Cloud Build
The project has been pre-configured in `eas.json` under the `preview` profile with `"buildType": "apk"`. Run:
```bash
eas build -p android --profile preview
```

### Step 4: Download and Install on Android Phone
1. When the build completes (usually takes a few minutes), EAS CLI will give you a **direct download URL** and a **QR code**.
2. Scan the QR code or open the download URL in your Android phone's browser.
3. Download the `.apk` file (e.g., `MyminiDr-preview.apk`).
4. Tap the downloaded file to install:
   - If prompted with *"For your security, your phone is not allowed to install unknown apps from this source"*, tap **Settings** and toggle **Allow from this source**.
   - Tap **Install**.
5. MyminiDr is now installed as a standalone app with its own app icon on your home screen!

---

## 🔒 4. Security & Privacy: Guest Mode & AES Encryption

### 👤 Secure Guest Mode
- Users can click **Continue as Guest** on the Welcome, Login, or Sign Up screens.
- Under the hood, this creates an anonymous session using Firebase Auth (`signInAnonymously`).
- **Data Isolation**: Guest users receive their own isolated Firebase UID so their data is completely separated and protected by Firestore security rules.
- **Account Upgrade**: At any time from the home menu, guests can choose *"Sign Up to Save"* to register an email and keep their history.

### 🛡️ End-to-End Chat & Data Encryption
- All chat messages and sensitive user attributes (such as Date of Birth) are encrypted using **AES-256** before being saved to Firestore or local storage.
- Key derivation uses the user's UID mixed with an application cryptographic pepper.
- Even if Firestore database entries are directly inspected, message contents appear as ciphertext (`enc:v1:...`) and cannot be read without decryption.
- Chat history automatically decrypts seamlessly on the client for the authenticated owner.

---

## 🌐 5. Deploying the Web App to Online Hosting (Optional)

You can host the web version permanently for free on platforms like Firebase Hosting, Vercel, or Netlify.

### Exporting the static web build:
```bash
npx expo export -p web
```
This generates the optimized web app inside the `dist` directory.

### To deploy to Firebase Hosting:
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run `firebase login`
3. Run `firebase init hosting` (choose `dist` as public directory, and configure as single-page app)
4. Deploy:
   ```bash
   firebase deploy --only hosting
   ```
Your app will be live on the web at `https://your-project.web.app`!
