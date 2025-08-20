import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  "projectId": "tradevision-lvz53",
  "appId": "1:992861212547:web:92a1dac42530ec07dcb0b6",
  "storageBucket": "tradevision-lvz53.firebasestorage.app",
  "apiKey": "AIzaSyBtDkq8mlJVLQQlxds91Ig80dyTXopd_G0",
  "authDomain": "tradevision-lvz53.firebaseapp.com",
  "messagingSenderId": "992861212547"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
