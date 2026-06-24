import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  push,
  remove,
} from 'firebase/database';

const firebaseConfig = {
  /*apiKey: "AIzaSyB0-XbbOjKufubDSwxrITrRvQICGs451lo",
  authDomain: "roboticarmapp.firebaseapp.com",
  projectId: "roboticarmapp",
  storageBucket: "roboticarmapp.firebasestorage.app",
  messagingSenderId: "602390886664",
  appId: "1:602390886664:web:c3c09f5b636435d26d54bd",
  measurementId: "G-7ZX0YLTE4N",
  databaseURL: "https://roboticarmapp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "roboticarmapp",
  storageBucket: "roboticarmapp.firebasestorage.app",
  messagingSenderId: "602390886664",
  appId: "1:602390886664:web:c3c09f5b636435d26d54bd",
  measurementId: "G-7ZX0YLTE4N",*/
  apiKey: "AIzaSyA2emfHNhH9VZ6NqUeM2_kbwzZHHYrgRFo",
  authDomain: "robotic-arm-7e0f0.firebaseapp.com",
  projectId: "robotic-arm-7e0f0",
  storageBucket: "robotic-arm-7e0f0.firebasestorage.app",
  messagingSenderId: "1070250375561",
  appId: "1:1070250375561:web:43eb48253a1e198f874958",
  measurementId: "G-WM7EGC0ZYN"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, get, onValue, push, remove };
