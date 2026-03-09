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
  apiKey: "AIzaSyB0-XbbOjKufubDSwxrITrRvQICGs451lo",
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
  measurementId: "G-7ZX0YLTE4N",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, get, onValue, push, remove };
