import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAMVIEC0lork20d7Z_Ma_6KxtgbgKKGE-k",
  authDomain: "hackaton-eba4d.firebaseapp.com",
  projectId: "hackaton-eba4d",
  storageBucket: "hackaton-eba4d.firebasestorage.app",
  messagingSenderId: "837132896288",
  appId: "1:837132896288:web:042a6704f4f11b7c6dd445",
  measurementId: "G-5NP1ESVDH2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.registerUser = async function (email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
};

window.loginUser = async function (email, password) {
  return signInWithEmailAndPassword(auth, email, password);
};

window.logoutUser = async function () {
  return signOut(auth);
};

window.checkUser = function (callback) {
  onAuthStateChanged(auth, callback);
};