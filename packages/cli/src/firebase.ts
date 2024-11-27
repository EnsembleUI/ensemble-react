import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyCz2PtDtfSybjPB5y0eGw4-gh3Aic55NFk",
  appId: "1:326748243798:web:36c3865e4ffbcc1c94b8f7",
  authDomain: "ensemble-web-studio.firebaseapp.com",
  databaseURL: "https://ensemble-web-studio-default-rtdb.firebaseio.com",
  measurementId: "G-ZMG2LD1NYR",
  messagingSenderId: "326748243798",
  projectId: "ensemble-web-studio",
  storageBucket: "ensemble-web-studio.appspot.com"
}

export const firebaseApp = initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);

export const auth = initializeAuth(firebaseApp);