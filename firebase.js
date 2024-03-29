// Firebase.tsx
import {initializeApp, getApps, getApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
import {getStorage} from 'firebase/storage';
import {initializeAuth, getReactNativePersistence} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAWPkdXoos1IjpJ0rS_ZqKRlPKjBYLX_vA',
  authDomain: 'nourishfit-planner.firebaseapp.com',
  databaseURL: 'https://nourishfit-planner-default-rtdb.firebaseio.com',
  projectId: 'nourishfit-planner',
  storageBucket: 'nourishfit-planner.appspot.com',
  messagingSenderId: '1067533845800',
  appId: '1:1067533845800:web:2f6120dfb3ca61a5783c1d',
  measurementId: 'G-QM06WCJCBQ',
};

// Initialize Firebase App
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Use the existing initialized app
}

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Initialize Auth with React Native AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export {auth, firestore, storage};
