import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "../config/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Login with email and password
 */
export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

/**
 * Register a new user with email and password
 */
export const registerUser = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Logout the current user
 */
export const logoutUser = async () => {
  await AsyncStorage.removeItem("jwtToken");
  return await signOut(auth);
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  return await sendPasswordResetEmail(auth, email);
};

/**
 * Update user email (requires re-authentication)
 */
export const updateUserEmail = async (newEmail, password) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Kullanıcı oturum açmamış");

  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
  return await updateEmail(user, newEmail);
};

/**
 * Update user password (requires re-authentication)
 */
export const updateUserPassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Kullanıcı oturum açmamış");

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  return await updatePassword(user, newPassword);
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};
