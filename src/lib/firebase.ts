import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace these placeholder values with your real Firebase Project configuration
// 1. Go to console.firebase.google.com
// 2. Create a new project and add a Web App
// 3. Paste the firebaseConfig object here
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
export const db = getFirestore(app);

// Configure Providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Request additional GitHub scopes if needed (e.g. to read repositories)
githubProvider.addScope('repo');
