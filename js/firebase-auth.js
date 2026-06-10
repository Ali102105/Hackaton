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

import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  remove,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

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
    score,
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

window.createPongRoom = async function () {
  const user = window.currentUser;
  if (!user) throw new Error("Login eerst.");

  const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
  const roomRef = ref(rtdb, "pongRooms/" + roomCode);

  await set(roomRef, {
    status: "waiting",
    host: user.uid,
    players: {
      p1: {
        uid: user.uid,
        email: user.email
      }
    },
    ball: {
      x: 320,
      y: 320,
      vx: 4,
      vy: 3
    },
    paddles: {
      p1: 260,
      p2: 260
    },
    score: {
      p1: 0,
      p2: 0
    },
    updatedAt: Date.now()
  });

  onDisconnect(roomRef).remove();
  return roomCode;
};

window.joinPongRoom = async function (roomCode) {
  const user = window.currentUser;
  if (!user) throw new Error("Login eerst.");

  roomCode = roomCode.trim().toUpperCase();
  const roomRef = ref(rtdb, "pongRooms/" + roomCode);
  const snap = await get(roomRef);

  if (!snap.exists()) throw new Error("Room bestaat niet.");

  const room = snap.val();
  if (room.players?.p2) throw new Error("Room is al vol.");

  await update(roomRef, {
    status: "playing",
    "players/p2": {
      uid: user.uid,
      email: user.email
    },
    updatedAt: Date.now()
  });

  return roomCode;
};

window.listenPongRoom = function (roomCode, callback) {
  const roomRef = ref(rtdb, "pongRooms/" + roomCode.trim().toUpperCase());
  return onValue(roomRef, (snap) => {
    callback(snap.val());
  });
};

window.updatePongPaddle = async function (roomCode, player, y) {
  if (!roomCode || !player) return;

  await update(ref(rtdb, "pongRooms/" + roomCode.trim().toUpperCase()), {
    [`paddles/${player}`]: y,
    updatedAt: Date.now()
  });
};

window.updatePongBall = async function (roomCode, ball, score) {
  if (!roomCode) return;

  await update(ref(rtdb, "pongRooms/" + roomCode.trim().toUpperCase()), {
    ball,
    score,
    updatedAt: Date.now()
  });
};

window.deletePongRoom = async function (roomCode) {
  if (!roomCode) return;
  await remove(ref(rtdb, "pongRooms/" + roomCode.trim().toUpperCase()));
};
