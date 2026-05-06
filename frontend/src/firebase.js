import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios";

// Your web app's Firebase configuration
// REPLACE THIS with your actual project config from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = () => {
  return getToken(messaging, { vapidKey: "YOUR_VAPID_KEY" })
    .then((currentToken) => {
      if (currentToken) {
        console.log("current token for client: ", currentToken);
        // Save token to backend
        saveTokenToBackend(currentToken);
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    })
    .catch((err) => {
      console.log("An error occurred while retrieving token. ", err);
    });
};

const saveTokenToBackend = async (token) => {
  try {
    const apiToken = localStorage.getItem("token");
    if (!apiToken) return;

    await axios.post("http://localhost:8080/api/auth/fcm-token", 
      { token }, 
      { headers: { Authorization: `Bearer ${apiToken}` } }
    );
    console.log("FCM Token saved to backend");
  } catch (err) {
    console.error("Failed to save FCM Token to backend", err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Message received. ", payload);
      resolve(payload);
    });
  });
