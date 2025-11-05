// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzdrAtJoBUONdyHsEPrzWDTH9FMg1xW78",
  authDomain: "supernova-372bf.firebaseapp.com",
  projectId: "supernova-372bf",
  storageBucket: "supernova-372bf.firebasestorage.app",
  messagingSenderId: "917055386010",
  appId: "1:917055386010:web:3f27d9173e3dd7fbdf8a23"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta instâncias corretas
export const auth = getAuth(app);
export const db = getFirestore(app);
