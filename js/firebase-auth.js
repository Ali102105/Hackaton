import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.currentUser = null;

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
  onAuthStateChanged(auth, (user) => {
    window.currentUser = user;
    callback(user);
  });
};

window.saveLeaderboardScore = async function (gameId, score) {
  const user = window.currentUser;

  if (!user || !gameId || score <= 0) return;

  const scoreRef = doc(db, "leaderboards", gameId, "scores", user.uid);

  const oldSnap = await getDoc(scoreRef);
  const oldScore = oldSnap.exists() ? Number(oldSnap.data().score || 0) : 0;

  if (score <= oldScore) return;

  await setDoc(scoreRef, {
    uid: user.uid,
    email: user.email,
    score: score,
    game: gameId,
    updatedAt: new Date().toISOString()
  });
};

window.getLeaderboard = async function (gameId) {
  const scoresRef = collection(db, "leaderboards", gameId, "scores");

  const q = query(scoresRef, orderBy("score", "desc"), limit(10));

  const snap = await getDocs(q);

  return snap.docs.map((doc) => doc.data());
};