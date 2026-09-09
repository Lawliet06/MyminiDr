# Privacy Policy

**App Name:** MyMiniDr (Dr. Tico AI Health Assistant)
**Last Updated:** September 9, 2026

---

## 1. Introduction

Welcome to **MyMiniDr**. We built this app to provide you with an AI-powered personal health assistant, "Dr. Tico," that helps you manage your health, understand symptoms, and access medication information. Your privacy matters deeply to us. This policy explains exactly what data we collect, why we collect it, and how we protect it.

---

## 2. Who We Are

MyMiniDr is a personal health assistant application built with Expo (React Native) and powered by Google's Gemini AI. The app is available on Android, iOS, and as a progressive web app (PWA).

---

## 3. Data We Collect

### a) Account & Authentication Data
- If you **Sign In with Google**, we collect your name, email address, and profile picture from your Google account via Firebase Authentication.
- If you **use Guest Mode**, we create an anonymous session using Firebase's `signInAnonymously()`. No personal information is required. A temporary anonymous user ID is generated and stored locally.

### b) Chat & Health Data
- Your **conversation messages** with Dr. Tico (text, and optionally images you share) are stored in **Firebase Firestore** under your user account.
- All messages are **encrypted using AES-256 encryption** before being saved. Each user's data is encrypted with a unique key derived from their user ID — your data cannot be read by other users.

### c) Images (Optional)
- If you choose to share an image (e.g., a photo of a medication or rash), it is sent to the **Google Cloud Vision API** to extract relevant labels, which are then passed to the AI for context.
- Images are **not stored** — they are processed in memory and discarded after the AI response is generated.

### d) Device & Technical Data
- Basic device information (platform: Android/iOS/Web) is used solely for app functionality (e.g., authentication persistence method).
- We do **not** collect or store IP addresses, location data, or device identifiers beyond what Firebase automatically provides.

---

## 4. How We Use Your Data

| Purpose | Data Used |
|---|---|
| Providing AI health responses | Your chat messages + optional image labels |
| Saving your chat history | Encrypted messages stored in Firestore |
| Authenticating you securely | Firebase Auth (Google or Anonymous) |
| Improving app stability | Error logs (no personal health data included) |

We **do not** use your health data for advertising, profiling, or selling to third parties.

---

## 5. Third-Party Services

MyMiniDr uses the following third-party services, each with their own privacy policies:

| Service | Purpose | Privacy Policy |
|---|---|---|
| **Firebase (Google)** | Authentication, Firestore database | https://firebase.google.com/support/privacy |
| **Google Gemini AI** | AI health responses (Dr. Tico) | https://ai.google.dev/terms |
| **Google Cloud Vision** | Image label analysis (optional) | https://cloud.google.com/vision/docs/data-usage |

---

## 6. Data Security

- All chat messages are **AES-256 encrypted** before being written to Firebase.
- Encryption keys are derived uniquely per user using SHA-256 key derivation — we cannot access your health conversations.
- Firebase is secured with Firestore security rules that restrict read/write access to authenticated users only.
- We use HTTPS/TLS for all network communication.

---

## 7. Data Retention

- **Authenticated users:** Your encrypted chat history is retained in Firestore as long as your account exists.
- **Guest users:** Data is stored locally and under an anonymous Firebase ID. Clearing app data or uninstalling the app removes local data.
- You may request deletion of your data at any time by contacting us (see Section 10).

---

## 8. Children's Privacy

MyMiniDr is **not intended for children under the age of 13**. We do not knowingly collect personal information from children. If you believe a child has provided us with information, please contact us and we will delete it promptly.

---

## 9. Medical Disclaimer

MyMiniDr and Dr. Tico are **not a substitute for professional medical advice, diagnosis, or treatment.** The information provided is for general informational purposes only. Always seek the advice of your qualified health provider with any questions you may have regarding a medical condition.

---

## 10. Your Rights

You have the right to:
- **Access** the data we hold about you.
- **Delete** your account and associated data.
- **Opt out** of non-essential data processing.

To exercise these rights, contact us at the email below.

---

## 11. Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be reflected by the "Last Updated" date at the top of this document.

---

## 12. Contact Us

If you have any questions or concerns about this Privacy Policy, please contact us at:

📧 **support@myminidr.com**
