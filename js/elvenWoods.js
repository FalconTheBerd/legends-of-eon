import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, update, onValue, remove, onDisconnect } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

let playerId = null;
let players = {};

// Predefined positions for environment elements
const environmentElements = [
    { x: 100, y: 150, type: 'tree' },
    { x: 300, y: 200, type: 'tree' },
    { x: 500, y: 350, type: 'bush' },
    { x: 700, y: 450, type: 'rock' },
    { x: 900, y: 250, type: 'flower' },
    { x: 1100, y: 600, type: 'tree' },
    { x: 1300, y: 750, type: 'water' },
    { x: 1500, y: 350, type: 'bush' },
    { x: 1700, y: 150, type: 'rock' },
    { x: 1900, y: 450, type: 'flower' },
    { x: 200, y: 300, type: 'tree' },
    { x: 400, y: 400, type: 'bush' },
    { x: 600, y: 500, type: 'flower' },
    { x: 800, y: 600, type: 'tree' },
    { x: 1000, y: 700, type: 'bush' },
    { x: 1200, y: 200, type: 'rock' },
    { x: 1400, y: 300, type: 'flower' },
    { x: 1600, y: 400, type: 'tree' },
    { x: 1800, y: 500, type: 'bush' },
    { x: 2000, y: 600, type: 'rock' }
];

// Function to render the environment
function renderEnvironment() {
    const gameWorld = document.getElementById('gameWorld');
    gameWorld.innerHTML = ''; // Clear existing environment

    environmentElements.forEach(element => {
        const el = document.createElement('div');
        el.classList.add(element.type);
        el.style.left = `${element.x}px`;
        el.style.top = `${element.y}px`;

        gameWorld.appendChild(el);
    });
}

// Function to update player position in the database
function updatePlayerPosition(x, y) {
    if (playerId) {
        const playerRef = ref(db, `players/${playerId}`);
        update(playerRef, { x, y });
    }
}

// Function to render players
function renderPlayers() {
    const gameWorld = document.getElementById('gameWorld');
    if (!gameWorld) return;

    gameWorld.innerHTML = ''; // Clear existing players

    // Render environment
    renderEnvironment();

    // Render players
    for (const id in players) {
        const playerData = players[id];
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('player');
        playerDiv.style.left = `${playerData.x}px`;
        playerDiv.style.top = `${playerData.y}px`;

        if (id === playerId) {
            playerDiv.style.backgroundColor = 'blue';
        } else {
            playerDiv.style.backgroundColor = 'green';
        }

        gameWorld.appendChild(playerDiv);
    }
}

// Listen for authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        playerId = user.uid;

        // Initialize player in database
        const playerRef = ref(db, `players/${playerId}`);
        set(playerRef, { x: 100, y: 100 });

        // Remove player from the database when they disconnect
        onDisconnect(playerRef).remove();

        // Listen for changes to players in the database
        const playersRef = ref(db, 'players');
        onValue(playersRef, (snapshot) => {
            players = snapshot.val() || {};
            renderPlayers();
        });
    } else {
        // Redirect to login page if not authenticated
        window.location.href = 'index.html';
    }
});

// Handle player movement
document.addEventListener('keydown', (e) => {
    const player = players[playerId];
    if (!player) return;

    let { x, y } = player;

    switch (e.key) {
        case 'ArrowUp':
            y -= 5;
            break;
        case 'ArrowDown':
            y += 5;
            break;
        case 'ArrowLeft':
            x -= 5;
            break;
        case 'ArrowRight':
            x += 5;
            break;
        case 'Escape':
            document.getElementById('exitPopup').style.display = 'block';
            break;
    }

    updatePlayerPosition(x, y);
});

function exitToHome() {
    const playerRef = ref(db, `players/${playerId}`);
    remove(playerRef).then(() => {
        window.location.href = 'home.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('exitToHomeButton').addEventListener('click', exitToHome);
    document.getElementById('closeExitPopup').addEventListener('click', () => {
        document.getElementById('exitPopup').style.display = 'none';
    });

    // Render the environment initially
    renderEnvironment();
});
