import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, sendPasswordResetEmail, deleteUser } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, remove, get, set, update, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyBAF2E7ZKI8dqYyYmGwLIruBBVG4SEV9ZQ",
    authDomain: "turnbasedrpg-4850c.firebaseapp.com",
    projectId: "turnbasedrpg-4850c",
    storageBucket: "turnbasedrpg-4850c.appspot.com",
    messagingSenderId: "240211116800",
    appId: "1:240211116800:web:0c6ed56a7233290632e9e5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();
const analytics = getAnalytics(app);

const possibleQuests = [
    { id: 1, description: 'Collect 10 herbs from the Elven Woods', progress: 0, goal: 10 },
    { id: 2, description: 'Defeat 5 monsters in the Dwarven Mountains', progress: 0, goal: 5 },
    { id: 3, description: 'Find the hidden treasure in the Mystic Isles', progress: 0, goal: 1 },
    { id: 4, description: 'Help 3 villagers in the Elven Woods', progress: 0, goal: 3 },
    { id: 5, description: 'Mine 15 ores in the Dwarven Mountains', progress: 0, goal: 15 },
    { id: 6, description: 'Gather 20 fish from the Mystic Isles', progress: 0, goal: 20 }
    // Add more quests as needed
];

document.addEventListener('DOMContentLoaded', () => {
    const isGitHubPages = location.hostname.includes('github.io');
    const repoName = 'randomgamename';
    const imagePath = isGitHubPages 
        ? `/${repoName}/assets/title.jpg` 
        : '../assets/title.jpg';
    
    document.body.style.background = `url(${imagePath}) no-repeat center center fixed`;

    // Add event listeners for navigation buttons
    document.getElementById('profileButton').addEventListener('click', openProfilePopup);
    document.getElementById('inventoryButton').addEventListener('click', openInventoryPopup);
    document.getElementById('partyButton').addEventListener('click', openPartyPopup);
    document.getElementById('questsButton').addEventListener('click', openQuestsPopup);
    document.getElementById('settingsButton').addEventListener('click', openSettingsPopup);

    // Add event listeners for close buttons
    document.getElementById('closeProfile').addEventListener('click', closeProfilePopup);
    document.getElementById('closeInventory').addEventListener('click', closeInventoryPopup);
    document.getElementById('closeParty').addEventListener('click', closePartyPopup);
    document.getElementById('closeQuests').addEventListener('click', closeQuestsPopup);
    document.getElementById('closeSettings').addEventListener('click', closeSettingsPopup);

    // Add event listeners for world map regions
    document.getElementById('elvenWoods').addEventListener('click', startElvenWoodsMission);
    document.getElementById('dwarvenMountains').addEventListener('click', startDwarvenMountainsMission);
    document.getElementById('mysticIsles').addEventListener('click', startMysticIslesMission);

    // Add event listeners for settings popup buttons
    document.getElementById('resetPasswordButton').addEventListener('click', resetPassword);
    document.getElementById('deleteAccountButton').addEventListener('click', deleteAccount);

    // Check for new quests assignment
    auth.onAuthStateChanged(user => {
        if (user) {
            const userId = user.uid;
            assignWeeklyQuests(userId);
            displayQuests(userId);
        }
    });
});

function openProfilePopup() {
    document.getElementById('profilePopup').style.display = 'block';
}

function closeProfilePopup() {
    document.getElementById('profilePopup').style.display = 'none';
}

function openInventoryPopup() {
    document.getElementById('inventoryPopup').style.display = 'block';
}

function closeInventoryPopup() {
    document.getElementById('inventoryPopup').style.display = 'none';
}

function openPartyPopup() {
    document.getElementById('partyPopup').style.display = 'block';
}

function closePartyPopup() {
    document.getElementById('partyPopup').style.display = 'none';
}

function openQuestsPopup() {
    document.getElementById('questsPopup').style.display = 'block';
}

function closeQuestsPopup() {
    document.getElementById('questsPopup').style.display = 'none';
}

function openSettingsPopup() {
    document.getElementById('settingsPopup').style.display = 'block';
}

function closeSettingsPopup() {
    document.getElementById('settingsPopup').style.display = 'none';
}

function startElvenWoodsMission() {
    alert('Starting mission in Elven Woods');
    // Implement mission start logic
}

function startDwarvenMountainsMission() {
    alert('Starting mission in Dwarven Mountains');
    // Implement mission start logic
}

function startMysticIslesMission() {
    alert('Starting mission in Mystic Isles');
    // Implement mission start logic
}

function resetPassword() {
    const user = auth.currentUser;
    if (user) {
        sendPasswordResetEmail(auth, user.email).then(() => {
            alert('Password reset email sent.');
        }).catch(error => {
            console.error('Error sending password reset email:', error);
            alert('Failed to send password reset email.');
        });
    } else {
        alert('No user is currently logged in.');
    }
}

function deleteAccount() {
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        const userRef = ref(db, `users/${userId}`);

        // Delete user data from database
        remove(userRef).then(() => {
            console.log('User data deleted from database.');

            // Remove the user from friends lists
            const usersRef = ref(db, 'users');
            get(usersRef).then(snapshot => {
                if (snapshot.exists()) {
                    const allUsers = snapshot.val();
                    const promises = [];

                    Object.keys(allUsers).forEach(otherUserId => {
                        if (otherUserId !== userId) {
                            const otherUserFriendsRef = ref(db, `users/${otherUserId}/friends/${userId}`);
                            promises.push(remove(otherUserFriendsRef));
                        }
                    });

                    Promise.all(promises).then(() => {
                        console.log('Removed from all friends lists.');

                        // Delete user account
                        deleteUser(user).then(() => {
                            localStorage.clear();
                            alert('Account deleted successfully.');
                            location.href = 'index.html'; // Assuming index.html is your title screen
                        }).catch(error => {
                            console.error('Error deleting user account:', error);
                            alert('Failed to delete account.');
                        });
                    }).catch(error => {
                        console.error('Error removing from friends lists:', error);
                        alert('Failed to remove from friends lists.');
                    });
                }
            }).catch(error => {
                console.error('Error fetching users:', error);
                alert('Failed to fetch users.');
            });
        }).catch(error => {
            console.error('Error deleting user data:', error);
            alert('Failed to delete user data.');
        });
    } else {
        alert('No user is currently logged in.');
    }
}

function assignWeeklyQuests(userId) {
    const userQuestsRef = ref(db, `users/${userId}/quests`);
    const currentWeek = new Date().toISOString().split('T')[0]; // Get current date for the week

    get(userQuestsRef).then(snapshot => {
        if (snapshot.exists()) {
            const userQuests = snapshot.val();
            if (userQuests.week === currentWeek) {
                console.log('Quests are already assigned for this week.');
                return;
            }
        }

        // Assign new quests
        const newQuests = [];
        const selectedQuests = new Set();
        while (selectedQuests.size < 3) {
            const randomQuest = possibleQuests[Math.floor(Math.random() * possibleQuests.length)];
            selectedQuests.add(randomQuest.id);
            newQuests.push(randomQuest);
        }

        const questsToSave = {
            week: currentWeek,
            quests: newQuests
        };

        set(userQuestsRef, questsToSave).then(() => {
            console.log('New quests assigned for the week.');
            displayQuests(userId);
        }).catch(error => {
            console.error('Error assigning new quests:', error);
        });
    }).catch(error => {
        console.error('Error fetching user quests:', error);
    });
}

function updateQuestProgress(userId, questId, progress) {
    const questRef = ref(db, `users/${userId}/quests/quests`);
    get(questRef).then(snapshot => {
        if (snapshot.exists()) {
            const quests = snapshot.val();
            const questIndex = quests.findIndex(q => q.id === questId);
            if (questIndex !== -1) {
                quests[questIndex].progress = progress;
                set(questRef, quests).then(() => {
                    console.log('Quest progress updated.');
                    displayQuests(userId);
                }).catch(error => {
                    console.error('Error updating quest progress:', error);
                });
            }
        }
    }).catch(error => {
        console.error('Error fetching quests:', error);
    });
}

function displayQuests(userId) {
    const userQuestsRef = ref(db, `users/${userId}/quests`);
    get(userQuestsRef).then(snapshot => {
        const questsPopupContent = document.getElementById('questsPopup').querySelector('.popup-content');
        questsPopupContent.innerHTML = '<span class="close" id="closeQuests">&times;</span><h2>Quests</h2>'; // Clear existing content

        if (snapshot.exists()) {
            const userQuests = snapshot.val();
            const quests = userQuests.quests;
            quests.forEach(quest => {
                const questDiv = document.createElement('div');
                questDiv.classList.add('quest-item');
                questDiv.innerHTML = `
                    <p>${quest.description}</p>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${(quest.progress / quest.goal) * 100}%"></div>
                    </div>
                    <p>${quest.progress}/${quest.goal}</p>
                    <button class="increment-progress-button" data-quest-id="${quest.id}">Complete Step</button>
                `;
                questsPopupContent.appendChild(questDiv);

                const incrementButton = questDiv.querySelector('.increment-progress-button');
                incrementButton.addEventListener('click', () => {
                    const newProgress = Math.min(quest.progress + 1, quest.goal);
                    updateQuestProgress(userId, quest.id, newProgress);
                });
            });
        } else {
            questsPopupContent.innerHTML += '<p>No quests available.</p>';
        }

        document.getElementById('closeQuests').addEventListener('click', closeQuestsPopup);
    }).catch(error => {
        console.error('Error fetching user quests:', error);
    });
}

function logout() {
    auth.signOut().then(() => {
        localStorage.clear();
        alert('Logged out successfully');
        location.href = 'index.html'; // Assuming index.html is your title screen
    }).catch(error => {
        console.error('Error logging out:', error);
        alert('Failed to log out.');
    });
}
