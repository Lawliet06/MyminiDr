import CryptoJS from "crypto-js";

// Application security salt used in key derivation to prevent rainbow table / dictionary attacks
const APP_PEPPER = "MyminiDr-SecureHealthData-2026";

/**
 * Derives a deterministic cryptographic key for a specific user.
 * Each user's data is isolated and encrypted using their own derived key.
 * @param {string} userId - User UID (from Firebase Auth)
 * @returns {string} - Derived secret key
 */
export const deriveUserKey = (userId) => {
  if (!userId) {
    // Default fallback key for guest/unauthenticated sessions
    return CryptoJS.SHA256(`guest-session-${APP_PEPPER}`).toString();
  }
  return CryptoJS.SHA256(`${userId}-${APP_PEPPER}`).toString();
};

/**
 * Encrypts arbitrary data (string, object, array) using AES.
 * @param {any} data - Plain data to encrypt
 * @param {string} [userId] - User ID to derive unique encryption key
 * @returns {string} - Ciphertext prefixed with 'enc:v1:'
 */
export const encryptData = (data, userId) => {
  if (data === null || data === undefined) return data;
  try {
    const key = deriveUserKey(userId);
    const plainString = typeof data === "object" ? JSON.stringify(data) : String(data);
    const encrypted = CryptoJS.AES.encrypt(plainString, key).toString();
    return `enc:v1:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    // Return original data as emergency fallback
    return data;
  }
};

/**
 * Decrypts ciphertext back to original data or object.
 * Seamlessly handles legacy unencrypted data without errors.
 * @param {string} encryptedText - Ciphertext or legacy string
 * @param {string} [userId] - User ID used when data was encrypted
 * @returns {any} - Decrypted data (parsed JSON object if applicable)
 */
export const decryptData = (encryptedText, userId) => {
  if (typeof encryptedText !== "string") return encryptedText;

  // If not encrypted with our format, return as-is (backwards compatibility)
  if (!encryptedText.startsWith("enc:v1:")) {
    return encryptedText;
  }

  try {
    const rawCipher = encryptedText.substring("enc:v1:".length);
    const key = deriveUserKey(userId);
    const bytes = CryptoJS.AES.decrypt(rawCipher, key);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      console.warn("Decryption returned empty string; key might not match");
      return encryptedText;
    }

    // Attempt JSON parse if it was an object/array
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    console.error("Decryption error:", error);
    return encryptedText;
  }
};

/**
 * Encrypts an array of chat messages before saving to Firestore.
 * @param {Array} messages - Chat messages array
 * @param {string} userId - User ID
 * @returns {string} - Encrypted payload string
 */
export const encryptMessages = (messages, userId) => {
  return encryptData(messages, userId);
};

/**
 * Decrypts chat messages loaded from Firestore.
 * Supports both new encrypted payload `{ encryptedPayload }` and legacy `{ messages: [...] }`.
 * @param {object} chatDocData - Document data from Firestore
 * @param {string} userId - User ID
 * @returns {Array} - Array of message objects
 */
export const decryptChatDocument = (chatDocData, userId) => {
  if (!chatDocData) return [];

  // If chatDocData has encryptedPayload, decrypt it
  if (chatDocData.encryptedPayload) {
    const decrypted = decryptData(chatDocData.encryptedPayload, userId);
    if (Array.isArray(decrypted)) {
      return decrypted;
    }
  }

  // If legacy unencrypted messages exist
  if (Array.isArray(chatDocData.messages)) {
    // Also decrypt any individually encrypted text inside messages if applicable
    return chatDocData.messages.map((msg) => ({
      ...msg,
      text: typeof msg.text === "string" ? decryptData(msg.text, userId) : msg.text,
    }));
  }

  return [];
};
