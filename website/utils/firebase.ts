import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: move to .env
const firebaseConfig = {
  apiKey: "AIzaSyAbt8x0AsLjXzlgxiPvBTC43UIQqoVNP-A",
  authDomain: "tix-queue.firebaseapp.com",
  projectId: "tix-queue",
  storageBucket: "tix-queue.appspot.com",
  messagingSenderId: "808885023221",
  appId: "1:808885023221:web:dabeb47165577c22beb0bc",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
