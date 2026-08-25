import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// This is safe to commit — it's a public client identifier, not a secret.
// Access is controlled by your Firestore security rules and Authentication,
// not by hiding this.
const firebaseConfig = {
  apiKey: "AIzaSyBnVQX4GBxOCFrkOtRKrQXDfp8UjE9BUww",
  authDomain: "dmv-drive-log.firebaseapp.com",
  projectId: "dmv-drive-log",
  storageBucket: "dmv-drive-log.firebasestorage.app",
  messagingSenderId: "789833299880",
  appId: "1:789833299880:web:086840a755bbda111e4f9d",
};

export const app = initializeApp(firebaseConfig);

// Offline persistence: caches data on-device (IndexedDB) so the app keeps
// working without a connection, and automatically syncs any local changes
// once connectivity returns. persistentMultipleTabManager allows this to
// work correctly even if the app is open in more than one tab at once.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

export const auth = getAuth(app);
