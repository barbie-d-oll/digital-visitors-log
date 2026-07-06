import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACa3UWLjyLye-ZJv04zxkmp-_dUFQvosQ",
  authDomain: "digital-visitors-log.firebaseapp.com",
  projectId: "digital-visitors-log",
  storageBucket: "digital-visitors-log.firebasestorage.app",
  messagingSenderId: "742804862458",
  appId: "1:742804862458:web:bd357e7e4bfc24706ea043",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);