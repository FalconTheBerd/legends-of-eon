import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBAF2E7ZKI8dqYyYmGwLIruBBVG4SEV9ZQ",
    authDomain: "turnbasedrpg-4850c.firebaseapp.com",
    projectId: "turnbasedrpg-4850c",
    storageBucket: "turnbasedrpg-4850c.appspot.com",
    messagingSenderId: "240211116800",
    appId: "1:240211116800:web:0c6ed56a7233290632e9e5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();

document.addEventListener('DOMContentLoaded', function () {
    const authStatus = localStorage.getItem('auth');
    const uId = localStorage.getItem('userId');

    if (authStatus == 'True') {
        const userRef = ref(db, 'users/' + uId);
        update(userRef, {
            status: 'Online'
        })
    }
});

window.addEventListener('beforeunload', function (event) {
    const uId = localStorage.getItem('userId');

    const userRef = ref(db, 'users/' + uId);
    update(userRef, {
        status: 'Offline'
    })
});