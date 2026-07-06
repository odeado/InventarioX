const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBr95Fb2l_kiV3lQSgKzN09TAsV9n0yXdU",
  authDomain: "juegos-online-99b20.firebaseapp.com",
  projectId: "juegos-online-99b20",
  storageBucket: "juegos-online-99b20.firebasestorage.app",
  messagingSenderId: "942532179041",
  appId: "1:942532179041:web:810314db76bb93ae26a620"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db };
