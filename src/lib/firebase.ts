import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC2uPhRygksWDv6YKrBwALxrQMYUoVQwBk",
  authDomain: "naturalremedies-772100.firebaseapp.com",
  projectId: "naturalremedies-772100",
  storageBucket: "naturalremedies-772100.firebasestorage.app",
  messagingSenderId: "503056875720",
  appId: "1:503056875720:web:72e85b00e1ac5ca8fc25fd",
};

// Initialize Firebase only if it hasn't been initialized yet (prevents errors in Next.js hot reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
