import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDwa0tAWDVjoCM39Mt6TgQJiLeSHQKCGhc",
  authDomain: "developer-platform-14d94.firebaseapp.com",
  projectId: "developer-platform-14d94",
  storageBucket: "developer-platform-14d94.firebasestorage.app",
  messagingSenderId: "203723843574",
  appId: "1:203723843574:web:1539ac53894029569209d7",
  measurementId: "G-2MCCGHYTZP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Explicitly persist auth state in localStorage (survives browser restarts)
setPersistence(auth, browserLocalPersistence).catch(console.error);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

// ─── Auth Providers ──────────────────────────────────────────────────────────

// Google: force account picker every time so multi-account users aren't surprised
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
googleProvider.addScope('email');
googleProvider.addScope('profile');

// GitHub: repo access + user profile
export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('repo');
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');
