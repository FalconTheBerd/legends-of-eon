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

    document.getElementById('profileButton').addEventListener('click', openProfilePopup);
    document.getElementById('friendsButton').addEventListener('click', openFriendsPopup);
    document.getElementById('partyButton').addEventListener('click', openPartyPopup);
    document.getElementById('questsButton').addEventListener('click', openQuestsPopup);
    document.getElementById('settingsButton').addEventListener('click', openSettingsPopup);

    document.getElementById('closeProfile').addEventListener('click', closeProfilePopup);
    document.getElementById('closeFriends').addEventListener('click', closeFriendsPopup);
    document.getElementById('closeParty').addEventListener('click', closePartyPopup);
    document.getElementById('closeQuests').addEventListener('click', closeQuestsPopup);
    document.getElementById('closeSettings').addEventListener('click', closeSettingsPopup);

    document.getElementById('elvenWoods').addEventListener('click', openElvenWoodsPopup);
    document.getElementById('dwarvenMountains').addEventListener('click', openDwarvenMountainsPopup);
    document.getElementById('mysticIsles').addEventListener('click', openMysticIslesPopup);

    document.getElementById('closeElvenWoods').addEventListener('click', closeElvenWoodsPopup);
    document.getElementById('closeDwarvenMountains').addEventListener('click', closeDwarvenMountainsPopup);
    document.getElementById('closeMysticIsles').addEventListener('click', closeMysticIslesPopup);

    document.getElementById('startElvenWoods').addEventListener('click', startElvenWoodsAdventure);
    document.getElementById('startDwarvenMountains').addEventListener('click', startDwarvenMountainsAdventure);
    document.getElementById('startMysticIsles').addEventListener('click', startMysticIslesAdventure);


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

function openFriendsPopup() {
    document.getElementById('friendsPopup').style.display = 'block';
    const userId = localStorage.getItem('userId');
    if (userId) {
        fetchFriends(userId);
    } else {
        document.getElementById('friendsList').innerHTML = '<p>No user logged in.</p>';
    }
}

function closeFriendsPopup() {
    document.getElementById('friendsPopup').style.display = 'none';
}

function openPartyPopup() {
    document.getElementById('partyPopup').style.display = 'block';
    const userId = localStorage.getItem('userId');
    if (userId) {
        displayPartyMembers(userId);
    } else {
        document.getElementById('partyMembersContainer').innerHTML = '<p>No user logged in.</p>';
    }
}

// Function to notify all party members to join the game
function notifyPartyToJoin(partyId, gameId) {
    const partyRef = ref(db, `parties/${partyId}/members`);
    get(partyRef).then((snapshot) => {
        if (snapshot.exists()) {
            const members = snapshot.val();
            for (const memberId in members) {
                const memberNotificationsRef = ref(db, `users/${memberId}/notifications`);
                const newNotificationRef = child(memberNotificationsRef, new Date().getTime().toString());
                set(newNotificationRef, {
                    type: 'joinGame',
                    gameId: gameId,
                    timestamp: new Date().toISOString()
                });
            }
        }
    });
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

function openElvenWoodsPopup() {
    document.getElementById('elvenWoodsPopup').style.display = 'block';
}

// Function to close the Elven Woods popup
function closeElvenWoodsPopup() {
    document.getElementById('elvenWoodsPopup').style.display = 'none';
}

// Function to open the Dwarven Mountains popup
function openDwarvenMountainsPopup() {
    document.getElementById('dwarvenMountainsPopup').style.display = 'block';
}

// Function to close the Dwarven Mountains popup
function closeDwarvenMountainsPopup() {
    document.getElementById('dwarvenMountainsPopup').style.display = 'none';
}

// Function to open the Mystic Isles popup
function openMysticIslesPopup() {
    document.getElementById('mysticIslesPopup').style.display = 'block';
}

// Function to close the Mystic Isles popup
function closeMysticIslesPopup() {
    document.getElementById('mysticIslesPopup').style.display = 'none';
}

function startElvenWoodsAdventure() {
    const userId = auth.currentUser.uid;
    const userRef = ref(db, `users/${userId}`);
    
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            const partyId = userData.partyId;
            if (partyId) {
                notifyPartyToJoin(partyId, 'elvenWoods');
            }
            window.location.href = 'elvenWoods.html';
        }
    }).catch((error) => {
        console.error('Error starting Elven Woods adventure:', error);
    });
}


function startDwarvenMountainsAdventure() {
    closeDwarvenMountainsPopup();
    alert("Starting adventure in Dwarven Mountains...");
    // Add logic to start the adventure in Dwarven Mountains
}

function startMysticIslesAdventure() {
    closeMysticIslesPopup();
    alert("Starting adventure in Mystic Isles...");
    // Add logic to start the adventure in Mystic Isles
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
            const currentWeek = new Date().toISOString().split('T')[0];

            const allQuestsCompleted = quests.every(quest => quest.progress >= quest.goal);

            if (allQuestsCompleted) {
                const nextWeekDate = new Date(userQuests.week);
                nextWeekDate.setDate(nextWeekDate.getDate() + 7);
                const timeUntilNextQuests = Math.max(0, (nextWeekDate - new Date()) / (1000 * 60 * 60 * 24)).toFixed(1); // Time in days

                questsPopupContent.innerHTML += `<p>All quests completed! New quests in ${timeUntilNextQuests} days.</p>`;
            } else {
                quests.forEach(quest => {
                    const questDiv = document.createElement('div');
                    questDiv.classList.add('quest-item');
                    if (quest.progress >= quest.goal) {
                        questDiv.innerHTML = `<p>Quest Completed! New quests in ${getTimeUntilNextWeek(userQuests.week)}</p>`;
                    } else {
                        questDiv.innerHTML = `
                            <p>${quest.description}</p>
                            <div class="progress-bar-container">
                                <div class="progress-bar" style="width: ${(quest.progress / quest.goal) * 100}%"></div>
                            </div>
                            <p>${quest.progress}/${quest.goal}</p>
                            <button class="increment-progress-button" data-quest-id="${quest.id}">Complete Step</button>
                        `;
                    }
                    questsPopupContent.appendChild(questDiv);

                    if (quest.progress < quest.goal) {
                        const incrementButton = questDiv.querySelector('.increment-progress-button');
                        incrementButton.addEventListener('click', () => {
                            const newProgress = Math.min(quest.progress + 1, quest.goal);
                            updateQuestProgress(userId, quest.id, newProgress);
                        });
                    }
                });
            }
        } else {
            questsPopupContent.innerHTML += '<p>No quests available.</p>';
        }

        document.getElementById('closeQuests').addEventListener('click', closeQuestsPopup);
    }).catch(error => {
        console.error('Error fetching user quests:', error);
    });
}

function getTimeUntilNextWeek(currentWeek) {
    const nextWeekDate = new Date(currentWeek);
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    return Math.max(0, (nextWeekDate - new Date()) / (1000 * 60 * 60 * 24)).toFixed(1) + ' days';
}


function displayPartyMembers(userId) {
    const userPartyRef = ref(db, `users/${userId}/party`);
    get(userPartyRef).then(snapshot => {
        const partyPopupContent = document.getElementById('partyPopup').querySelector('.popup-content');
        partyPopupContent.innerHTML = '<span class="close" id="closeParty">&times;</span><h2>Party Members</h2>'; // Clear existing content

        if (snapshot.exists()) {
            const partyMembers = snapshot.val();
            console.log('Party Members:', partyMembers);

            // Iterate over party members and fetch their details
            const memberPromises = Object.keys(partyMembers).map(memberId => {
                const memberRef = ref(db, `users/${memberId}`);

                return get(memberRef).then(memberSnapshot => {
                    if (memberSnapshot.exists()) {
                        const memberData = memberSnapshot.val();
                        const memberDiv = document.createElement('div');
                        memberDiv.classList.add('party-member');
                        memberDiv.innerHTML = `
                            <span>${memberData.username || memberData.email.split('@')[0]}</span>
                            <button class="remove-member-button" data-member-id="${memberId}">Remove</button>
                        `;
                        partyPopupContent.appendChild(memberDiv);

                        const removeButton = memberDiv.querySelector('.remove-member-button');
                        removeButton.addEventListener('click', () => {
                            removePartyMember(userId, memberId);
                        });
                    }
                }).catch(error => {
                    console.error('Error fetching party member data:', error);
                });
            });

            // Wait for all member data to be fetched
            Promise.all(memberPromises).then(() => {
                console.log('Party members displayed');
            }).catch(error => {
                console.error('Error displaying party members:', error);
            });
        } else {
            console.log('No party members found.');
            partyPopupContent.innerHTML += '<p>No party members found.</p>';
        }

        document.getElementById('closeParty').addEventListener('click', closePartyPopup);
    }).catch(error => {
        console.error('Error fetching party members:', error);
    });
}

function removePartyMember(userId, memberId) {
    const userPartyRef = ref(db, `users/${userId}/party/${memberId}`);
    const memberPartyRef = ref(db, `users/${memberId}/party/${userId}`);

    // Remove from both parties
    Promise.all([remove(userPartyRef), remove(memberPartyRef)]).then(() => {
        console.log(`Removed ${memberId} from ${userId}'s party and vice versa.`);
        displayPartyMembers(userId); // Refresh the party members display
    }).catch(error => {
        console.error('Error removing party member:', error);
    });
}

function fetchFriends(userId) {
    const userRef = ref(db, `users/${userId}/friends`);
    get(userRef).then(snapshot => {
        const friendsList = document.getElementById('friendsList');
        friendsList.innerHTML = ''; // Clear existing content

        if (snapshot.exists()) {
            const friends = snapshot.val();
            console.log('Friends:', friends);

            // Iterate over friends and fetch their details
            const friendPromises = Object.keys(friends).map(friendId => {
                const friendRef = ref(db, `users/${friendId}`);

                return get(friendRef).then(friendSnapshot => {
                    if (friendSnapshot.exists()) {
                        const friendData = friendSnapshot.val();
                        const friendDiv = document.createElement('div');
                        friendDiv.classList.add('friend-item');
                        friendDiv.innerHTML = `
                            <span class="friend-name">${friendData.username || friendData.email.split('@')[0]} (${friendData.status})</span>
                            <div class="buttons-container" style="display: none;">
                                <button class="invite-button" data-friend-id="${friendId}">Invite to Party</button>
                                <button class="remove-friend-button" data-friend-id="${friendId}">Unfriend</button>
                            </div>
                        `;
                        friendsList.appendChild(friendDiv);

                        const friendName = friendDiv.querySelector('.friend-name');
                        const buttonsContainer = friendDiv.querySelector('.buttons-container');

                        friendName.addEventListener('click', () => {
                            buttonsContainer.style.display = buttonsContainer.style.display === 'block' ? 'none' : 'block';
                        });

                        const inviteButton = friendDiv.querySelector('.invite-button');
                        inviteButton.addEventListener('click', () => {
                            sendPartyInvitation(userId, friendId);
                        });

                        const removeButton = friendDiv.querySelector('.remove-friend-button');
                        removeButton.addEventListener('click', () => {
                            removeFriend(userId, friendId);
                        });
                    }
                }).catch(error => {
                    console.error('Error fetching friend data:', error);
                });
            });

            // Wait for all friend data to be fetched
            Promise.all(friendPromises).then(() => {
                console.log('Friends displayed');
            }).catch(error => {
                console.error('Error displaying friends:', error);
            });
        } else {
            console.log('No friends found.');
            friendsList.innerHTML += '<p>No friends found.</p>';
        }

        document.getElementById('closeFriends').addEventListener('click', closeFriendsPopup);
    }).catch(error => {
        console.error('Error fetching friends:', error);
    });
}

function sendPartyInvitation(userId, friendId) {
    const invitationRef = ref(db, `invitations/${friendId}/${userId}`);
    const username = localStorage.getItem('username');

    set(invitationRef, {
        from: userId,
        fromName: username,
        status: 'pending',
        timestamp: new Date().toISOString()
    }).then(() => {
        alert('Invitation sent.');
    }).catch(error => {
        console.error('Error sending invitation:', error);
        alert('Failed to send invitation.');
    });
}

function removeFriend(userId, friendId) {
    const userFriendsRef = ref(db, `users/${userId}/friends/${friendId}`);
    const friendFriendsRef = ref(db, `users/${friendId}/friends/${userId}`);

    // Remove from both friends lists
    Promise.all([remove(userFriendsRef), remove(friendFriendsRef)]).then(() => {
        console.log(`Removed ${friendId} from ${userId}'s friends and vice versa.`);
        fetchFriends(userId); // Refresh the friends display
    }).catch(error => {
        console.error('Error removing friend:', error);
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
