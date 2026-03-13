import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
 apiKey: "AIzaSyDWaAcREPEFt0Lco3og1x_Ad7E4LR3G-Zg",
  authDomain: "goalie-tracking.firebaseapp.com",
  projectId: "goalie-tracking",
  storageBucket: "goalie-tracking.firebasestorage.app",
  messagingSenderId: "417947012410",
  appId: "1:417947012410:web:49bf3cf7ea208a331b5403",
  measurementId: "G-1SXMG9JGWS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
