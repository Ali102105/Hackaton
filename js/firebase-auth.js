import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { firebaseConfig } from "./config.js";

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
