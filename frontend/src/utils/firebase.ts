import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: move to .env
const firebaseConfig = {
  apiKey: "AIzaSyBHK4aWZRa1LHRUd0PRPFV1ua3zQnFFDF0",
  authDomain: "tix-q-14bf0.firebaseapp.com",
  projectId: "tix-q-14bf0",
  storageBucket: "tix-q-14bf0.appspot.com",
  messagingSenderId: "943319592130",
  appId: "1:943319592130:web:5fe583d4980428d43e1f5b",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
