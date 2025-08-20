// public/js/auth.js

import { auth } from "../firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export function initAuthListeners({ onSignedIn, onSignedOut }) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      onSignedIn(user);
    } else {
      onSignedOut();
    }
  });
}

export async function signUp(name, email, pass) {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(cred.user, { displayName: name });
}

export function logIn(email, pass) {
  return signInWithEmailAndPassword(auth, email, pass);
}

export function socialLogin(providerName) {
  const provider =
    providerName === "google" ? googleProvider : facebookProvider;
  return signInWithPopup(auth, provider);
}

export function logOut() {
  return signOut(auth);
}
