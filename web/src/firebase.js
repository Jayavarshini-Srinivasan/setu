import {
  initializeApp,
} from "firebase/app";

import {
  getAuth,
} from "firebase/auth";

import {
  getFirestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:
    "AIzaSyBir3B2UVDrccRErDS4j1cCt0tBxlQ3ktY",

  authDomain:
    "job-platform-mvp-a2e09.firebaseapp.com",

  projectId:
    "job-platform-mvp-a2e09",

  storageBucket:
    "job-platform-mvp-a2e09.firebasestorage.app",

  messagingSenderId:
    "1093132141933",

  appId:
    "1:1093132141933:web:f6253a648b8aa4196e4664",
};

const app =
  initializeApp(
    firebaseConfig
  );

const auth =
  getAuth(app);

const db =
  getFirestore(app);

export {
  auth,
  db,
};