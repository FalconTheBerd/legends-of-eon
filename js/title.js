import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, get, child, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
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

document.addEventListener('DOMContentLoaded', () => {
    const isGitHubPages = location.hostname.includes('github.io');
    const repoName = 'randomgamename';
    const imagePath = isGitHubPages 
        ? `/${repoName}/assets/title.jpg` 
        : '../assets/title.jpg';
    
    document.body.style.background = `url(${imagePath}) no-repeat center center fixed`;
});

function logout() {
    const uId = localStorage.getItem('userId');
    if (uId) {
        const userRef = ref(db, 'users/' + uId);
        update(userRef, {
            status: 'Offline'
        })
            .then(() => {
                console.log('User status updated to Offline');
                localStorage.clear();
                alert('Logged out successfully');
                location.reload();
            })
            .catch((error) => {
                console.error("Error updating user status:", error);
                localStorage.clear();
                alert('Logged out successfully (status update failed)');
                location.reload();
            });
    } else {
        localStorage.clear();
        alert('Logged out successfully');
        location.reload();
    }
}

document.getElementById('logOutButton').addEventListener('click', logout);

window.playFunction = function playFunction() {
    alert("Play button clicked");
}

window.settingsFunction = function settingsFunction() {
    document.getElementById('settingsPopup').style.display = 'block';
}

window.closeSettingsPopup = function closeSettingsPopup() {
    document.getElementById('settingsPopup').style.display = 'none';
}

document.getElementById('resetPasswordButton').addEventListener('click', () => {
    const email = document.getElementById('reset-email').value;

    if (email) {
        sendPasswordResetEmail(auth, email)
            .then(() => {
                alert('Password reset email sent');
                closeSettingsPopup();
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(`Error: ${errorMessage}`);
            });
    } else {
        alert('Please enter your email address.');
    }
});

document.getElementById('deleteAccountButton').addEventListener('click', () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        const user = auth.currentUser;

        if (user) {
            const userId = user.uid;
            const userRef = ref(db, `users/${userId}`);
            const friendsRef = ref(db, `users/${userId}/friends`);

            // Fetch the user's friends list to remove the user from their friend lists
            get(friendsRef).then(snapshot => {
                if (snapshot.exists()) {
                    const friends = snapshot.val();
                    const removeFriendsPromises = Object.keys(friends).map(friendId => {
                        const friendRef = ref(db, `users/${friendId}/friends/${userId}`);
                        return remove(friendRef);
                    });

                    return Promise.all(removeFriendsPromises);
                }
            }).then(() => {
                // Delete the user from the database
                return remove(userRef);
            }).then(() => {
                console.log(`Deleted user data for user ID: ${userId}`);
                
                // Delete the user from Firebase Authentication
                return user.delete();
            }).then(() => {
                alert('Account deleted successfully');

                // Clear local storage
                localStorage.clear();

                // Log out the user
                auth.signOut().then(() => {
                    console.log('User signed out');
                    closeSettingsPopup();
                }).catch(error => {
                    console.error('Error signing out user:', error);
                });
            }).catch((error) => {
                console.error('Error deleting account or related data:', error);
                alert('Failed to delete account. Please try again.');
            });
        } else {
            alert('No user is currently signed in.');
        }
    }
});



window.socialFunction = function socialFunction() {
    if (localStorage.getItem('auth') ==  'True'){
    fetchFriends();
    document.getElementById('friendsPopup').style.display = 'block';
    } else {
        alert('You must be logged in to view your friends');
    }
}

window.openPopup = function openPopup() {
    document.getElementById('accountPopup').style.display = 'block';
}

window.closePopup = function closePopup() {
    document.getElementById('accountPopup').style.display = 'none';
}

window.closeFriendsPopup = function closeFriendsPopup() {
    document.getElementById('friendsPopup').style.display = 'none';
}

window.showSignUpForm = function showSignUpForm() {
    document.getElementById('signInForm').style.display = 'none';
    document.getElementById('signUpForm').style.display = 'block';
    document.getElementById('resetPasswordForm').style.display = 'none';
}

window.showSignInForm = function showSignInForm() {
    document.getElementById('signUpForm').style.display = 'none';
    document.getElementById('signInForm').style.display = 'block';
    document.getElementById('resetPasswordForm').style.display = 'none';
}

window.showResetPasswordForm = function showResetPasswordForm() {
    document.getElementById('signUpForm').style.display = 'none';
    document.getElementById('signInForm').style.display = 'none';
    document.getElementById('resetPasswordForm').style.display = 'block';
}

function registerDatabase(id, email, username) {
    set(ref(db, 'users/' + id), {
        uid: id,
        email: email,
        status: 'Offline',
        username: username
    }).then(() => {
        console.log("User registered successfully");
    }).catch((error) => {
        console.error("Error registering user:", error);
    });
}

document.getElementById('signin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-username').value;
    const password = document.getElementById('signin-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const userRef = ref(db, 'users/' + user.uid);
            update(userRef, {
                status: 'Online'
            })
                .then(() => {
                    localStorage.setItem('auth', 'True');
                    localStorage.setItem('userEmail', user.email);
                    localStorage.setItem('userId', user.uid);
                    alert('Signed in successfully');
                    closePopup();
                })
                .catch((error) => {
                    console.error("Error updating user status:", error);
                    alert('Signed in successfully, but failed to update status');
                    closePopup();
                });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`Error: ${errorMessage}`);
        });
});

document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const username  = document.getElementById('signup-username').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            registerDatabase(user.uid, user.email, username);
            alert('Signed up successfully');
            closePopup();
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`Error: ${errorMessage}`);
        });
});

document.getElementById('reset-password-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert('Password reset email sent');
            closePopup();
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`Error: ${errorMessage}`);
        });
});

function addFriend() {
    const friendEmail = prompt("Enter your friend's email:");

    if (!friendEmail) {
        return;
    }

    const usersRef = ref(db, 'users');

    get(usersRef).then((snapshot) => {
        let friendId = null;
        let currentUserId = localStorage.getItem('userId');
        let currentUserUsername = localStorage.getItem('username');

        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            if (user.email === friendEmail) {
                friendId = childSnapshot.key;
            }
        });

        if (friendId) {
            const userFriendsRef = ref(db, `users/${currentUserId}/friends`);
            const friendName = currentUserUsername;
            const friendData = {
                name: friendName,
                addedOn: new Date().toISOString()
            };

            update(child(userFriendsRef, friendId), friendData)
                .then(() => {
                    const friendFriendsRef = ref(db, `users/${friendId}/friends`);
                    const userData = {
                        name: friendEmail.split('@')[0],
                        addedOn: new Date().toISOString()
                    };

                    update(child(friendFriendsRef, currentUserId), userData)
                        .then(() => {
                            alert(`Added ${friendEmail} as a friend.`);
                            fetchFriends();
                        })
                        .catch((error) => {
                            console.error('Error adding current user as friend:', error);
                            alert('Failed to add friend.');
                        });
                })
                .catch((error) => {
                    console.error('Error adding friend:', error);
                    alert('Failed to add friend.');
                });

        } else {
            alert(`User with email ${friendEmail} does not exist.`);
        }
    }).catch((error) => {
        console.error('Error checking friend email:', error);
        alert('Failed to check friend email.');
    });
}

document.getElementById('addFriendButton').addEventListener('click', addFriend);

function fetchFriends() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('No user logged in');
        return;
    }

    const friendsList = document.getElementById('friendsList');
    friendsList.innerHTML = 'Loading...';

    const userRef = ref(db, `users/${userId}/friends`);

    get(userRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const friends = snapshot.val();
                friendsList.innerHTML = '';
                for (const friendId in friends) {
                    const friendRef = ref(db, `users/${friendId}`);
                    Promise.all([
                        get(friendRef),
                        getUserOnlineStatus(friendId)
                    ]).then(([friendSnapshot, onlineStatus]) => {
                        if (friendSnapshot.exists()) {
                            const friendData = friendSnapshot.val();
                            const friendItem = document.createElement('div');
                            friendItem.classList.add('friend-item');

                            const friendName = document.createElement('span');
                            friendName.textContent = `${friendData.username} (${onlineStatus})`;
                            friendName.classList.add('friend-name');
                            friendName.addEventListener('click', () => toggleButtons(friendItem));
                            friendItem.appendChild(friendName);

                            const buttonsContainer = document.createElement('div');
                            buttonsContainer.classList.add('buttons-container');

                            const inviteButton = document.createElement('button');
                            inviteButton.textContent = 'Invite to Party';
                            inviteButton.classList.add('invite-button');
                            inviteButton.addEventListener('click', () => {
                                const userId = localStorage.getItem('userId');
                                const username = localStorage.getItem('email');
                                const friendId = friendData.uid;

                                if (!userId || !friendId) {
                                    alert('Error: User or friend ID not found.');
                                    return;
                                }

                                // Send the invitation
                                const invitationRef = ref(db, `invitations/${friendId}/${userId}`);
                                set(invitationRef, {
                                    from: username,
                                    fromName: username, // Send the username with the invitation
                                    status: 'pending',
                                    timestamp: new Date().toISOString()
                                }).then(() => {
                                    // alert(`Invitation sent to ${friendData.username || friendData.email.split('@')[0]}`);
                                }).catch(error => {
                                    console.error('Error sending invitation:', error);
                                    alert('Failed to send invitation.');
                                });
                            });

                            const unfriendButton = document.createElement('button');
                            unfriendButton.textContent = 'Unfriend';
                            unfriendButton.classList.add('unfriend-button');
                            unfriendButton.addEventListener('click', () => {
                                if (confirm('Are you sure you want to unfriend this user?')) {
                                    remove(child(userRef, friendId))
                                        .then(() => {
                                            return remove(ref(db, `users/${friendId}/friends/${userId}`));
                                        })
                                        .then(() => {
                                            alert('Unfriended successfully');
                                            fetchFriends();
                                        })
                                        .catch((error) => {
                                            console.error('Error unfriending user:', error);
                                            alert('Failed to unfriend user.');
                                        });
                                }
                            });

                            buttonsContainer.appendChild(inviteButton);
                            buttonsContainer.appendChild(unfriendButton);
                            friendItem.appendChild(buttonsContainer);

                            friendsList.appendChild(friendItem);
                        }
                    });
                }
            } else {
                friendsList.innerHTML = 'No friends found';
            }
        })
        .catch((error) => {
            console.error('Error fetching friends:', error);
            friendsList.innerHTML = 'Error loading friends';
        });
}

function getUserOnlineStatus(userId) {
    return get(ref(db, `users/${userId}/status`))
        .then(snapshot => snapshot.exists() ? snapshot.val() : 'Offline')
        .catch(error => {
            console.error('Error fetching user status:', error);
            return 'Unknown';
        });
}

function toggleButtons(friendItem) {
    const buttonsContainer = friendItem.querySelector('.buttons-container');
    if (buttonsContainer.style.display === 'block') {
        buttonsContainer.style.display = 'none';
    } else {
        buttonsContainer.style.display = 'block';
    }
}

// Function to fetch party invitations



function acceptInvitation(userId, senderId, notificationElement) {
    const invitationRef = ref(db, `invitations/${userId}/${senderId}`);
    const senderPartyRef = ref(db, `users/${senderId}/party`);
    const userPartyRef = ref(db, `users/${userId}/party`);

    // Fetch the current party members of the sender
    get(senderPartyRef).then(snapshot => {
        let senderPartyMembers = snapshot.exists() ? snapshot.val() : {};

        // Add the current user to the sender's party
        senderPartyMembers[userId] = true;

        // Update the sender's party in the database
        set(senderPartyRef, senderPartyMembers).then(() => {
            // Fetch the current party members of the user
            get(userPartyRef).then(snapshot => {
                let userPartyMembers = snapshot.exists() ? snapshot.val() : {};

                // Add the sender to the user's party
                userPartyMembers[senderId] = true;

                // Update the user's party in the database
                set(userPartyRef, userPartyMembers).then(() => {
                    // Remove the invitation
                    remove(invitationRef).then(() => {
                        console.log('Invitation removed');
                       // alert('Invitation accepted and both parties updated.');
                        // Remove the notification element
                        if (notificationElement) {
                            notificationElement.remove();
                        }
                    }).catch((error) => {
                        console.error('Error removing invitation:', error);
                    });
                }).catch(error => {
                    console.error('Error updating user party:', error);
                    alert('Failed to accept invitation.');
                });
            }).catch(error => {
                console.error('Error fetching user party data:', error);
                alert('Failed to fetch user party data.');
            });
        }).catch(error => {
            console.error('Error updating sender party:', error);
            alert('Failed to accept invitation.');
        });
    }).catch(error => {
        console.error('Error fetching sender party data:', error);
        alert('Failed to fetch sender party data.');
    });
}

function declineInvitation(userId, inviterId, notificationElement) {
    const invitationRef = ref(db, `invitations/${userId}/${inviterId}`);
    update(invitationRef, { status: 'declined' }).then(() => {
        // Handle additional logic for declining the invitation
        // alert('Invitation declined');
        // Remove the invitation
        remove(invitationRef).then(() => {
            console.log('Invitation removed');
            // Remove the notification element
            if (notificationElement) {
                notificationElement.remove();
            }
        }).catch((error) => {
            console.error('Error removing invitation:', error);
        });
    }).catch(error => {
        console.error('Error declining invitation:', error);
        alert('Failed to decline invitation.');
    });
}

function handleInvitationResponse(inviterId, isAccepted, notificationElement) {
    const userId = localStorage.getItem('userId');
    const invitationRef = ref(db, `invitations/${userId}/${inviterId}`);

    if (isAccepted) {
        acceptInvitation(userId, inviterId, notificationElement);
    } else {
        declineInvitation(userId, inviterId, notificationElement);
    }
}

function displayInvitationNotification(inviterId, timestamp) {
    console.log(`Displaying notification for inviterId: ${inviterId}, timestamp: ${timestamp}`);
    const notificationArea = document.getElementById('notification-area');
    
    // Check if the notification for this inviter already exists
    if (document.getElementById(`invitation-${inviterId}`)) {
        console.log(`Notification for inviterId: ${inviterId} already exists`);
        return; // If it exists, do not add it again
    }

    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.id = `invitation-${inviterId}`; // Unique ID for each notification

    const inviterNameRef = ref(db, `users/${inviterId}/username`);
    get(inviterNameRef).then((snapshot) => {
        const inviterName = snapshot.val() || inviterId;
        notification.innerHTML = `
            <p>${inviterName} has invited you to a party.</p>
            <button class="accept-button">Accept</button>
            <button class="decline-button">Decline</button>
        `;

        const acceptButton = notification.querySelector('.accept-button');
        const declineButton = notification.querySelector('.decline-button');

        acceptButton.addEventListener('click', () => handleInvitationResponse(inviterId, true, notification));
        declineButton.addEventListener('click', () => handleInvitationResponse(inviterId, false, notification));

        notificationArea.appendChild(notification);
        console.log(`Notification for inviterId: ${inviterId} added`);
    }).catch(error => {
        console.error(`Error fetching inviter name for inviterId: ${inviterId}`, error);
    });
}


function fetchPartyInvitations() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        return;
    }

    const invitationsRef = ref(db, `invitations/${userId}`);
    onValue(invitationsRef, (snapshot) => {
        console.log(`fetchPartyInvitations triggered for userId: ${userId}`);
        if (snapshot.exists()) {
            const invitations = snapshot.val();
            const invitationContainer = document.getElementById('invitationContainer');
            invitationContainer.innerHTML = '';

            for (const senderId in invitations) {
                const invitation = invitations[senderId];
                if (invitation.status === 'pending') {
                    displayInvitationNotification(senderId, invitation.timestamp);
                }
            }
        }
    });
}

function removeFromAllParties(userId) {
    const usersRef = ref(db, 'users');

    // Fetch all users
    get(usersRef).then(snapshot => {
        if (snapshot.exists()) {
            const allUsers = snapshot.val();

            // Create an array of promises to remove the user from all parties
            const promises = Object.keys(allUsers).map(otherUserId => {
                if (otherUserId !== userId) {  // Avoid self-removal
                    const otherUserPartyRef = ref(db, `users/${otherUserId}/party/${userId}`);

                    // Remove the current user from the other user's party
                    return remove(otherUserPartyRef).then(() => {
                        console.log(`Removed from ${otherUserId}'s party`);
                    }).catch(error => {
                        console.error(`Error removing from ${otherUserId}'s party:`, error);
                    });
                }
            });

            // Add a promise to clear the user's own party
            const userPartyRef = ref(db, `users/${userId}/party`);
            promises.push(remove(userPartyRef).then(() => {
                console.log(`Cleared ${userId}'s own party`);
            }).catch(error => {
                console.error(`Error clearing ${userId}'s own party:`, error);
            }));

            // Wait for all promises to complete
            Promise.all(promises).then(() => {
                console.log('Removed from all parties and cleared own party');
                displayPartyMembers(userId);  // Refresh the party members display
            }).catch(error => {
                console.error('Error removing from all parties or clearing own party:', error);
            });
        } else {
            console.log('No users found');
        }
    }).catch(error => {
        console.error('Error fetching users:', error);
    });
}

function displayPartyMembers(userId) {
    const userPartyRef = ref(db, `users/${userId}/party`);
    console.log(`Setting up listener for party members of user ID: ${userId}`);

    // Set up a real-time listener for the party members
    onValue(userPartyRef, snapshot => {
        const partyMembersContainer = document.getElementById('partyMembersContainer');
        partyMembersContainer.innerHTML = ''; // Clear existing content

        const heading = document.createElement('div');
        heading.classList.add('party-heading');
        heading.textContent = 'Party Members';
        partyMembersContainer.appendChild(heading);

        if (snapshot.exists()) {
            const partyMembers = snapshot.val();
            console.log('Party Members:', partyMembers);

            // Iterate over party members and fetch their details
            const memberPromises = Object.keys(partyMembers).map(memberId => {
                const memberRef = ref(db, `users/${memberId}`);
                console.log(`Fetching details for member ID: ${memberId}`);

                return get(memberRef).then(memberSnapshot => {
                    if (memberSnapshot.exists()) {
                        const memberData = memberSnapshot.val();
                        console.log(`Fetched details for member ID: ${memberId}`, memberData);

                        const memberDiv = document.createElement('div');
                        memberDiv.classList.add('party-member');

                        const memberName = document.createElement('span');
                        memberName.textContent = memberData.username || memberData.email.split('@')[0];
                        memberDiv.appendChild(memberName);

                        const memberStatus = document.createElement('div');
                        memberStatus.classList.add('party-member-status');
                        memberStatus.textContent = memberData.status;
                        memberDiv.appendChild(memberStatus);

                        const removeButton = document.createElement('button');
                        removeButton.classList.add('party-member-button');
                        removeButton.textContent = 'Remove';
                        removeButton.addEventListener('click', () => {
                            removeFromParty(userId, memberId);
                        });
                        memberDiv.appendChild(removeButton);

                        partyMembersContainer.appendChild(memberDiv);
                        console.log(`Appended member ID: ${memberId} to partyMembersContainer`);
                    } else {
                        console.error('Party member does not exist:', memberId);
                    }
                }).catch(error => {
                    console.error('Error fetching party member data:', error);
                });
            });

            // Wait for all member data to be fetched
            Promise.all(memberPromises).then(() => {
                console.log('Party members displayed');
                partyMembersContainer.style.display = 'block'; // Make the container visible
            }).catch(error => {
                console.error('Error displaying party members:', error);
            });
        } else {
            console.log('No party members found.');
            partyMembersContainer.innerHTML += '<div>No party members found.</div>';
            partyMembersContainer.style.display = 'block'; // Show message in container
        }
    }, error => {
        console.error('Error setting up party members listener:', error);
    });
}

function removeFromParty(userId, memberId) {
    const userPartyRef = ref(db, `users/${userId}/party/${memberId}`);
    const memberPartyRef = ref(db, `users/${memberId}/party/${userId}`);

    // Remove the member from the user's party
    remove(userPartyRef).then(() => {
        console.log(`Removed member ID: ${memberId} from user ID: ${userId}'s party`);

        // Remove the user from the member's party
        return remove(memberPartyRef);
    }).then(() => {
        console.log(`Removed user ID: ${userId} from member ID: ${memberId}'s party`);
        // Refresh the party members display
        displayPartyMembers(userId);
    }).catch(error => {
        console.error('Error removing party member:', error);
    });
}


document.getElementById('leavePartyButton').addEventListener('click', () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        removeFromAllParties(userId);
    } else {
        alert('User ID not found');
    }
});

auth.onAuthStateChanged(user => {
    if (user) {
        const userId = user.uid;
        const userRef = ref(db, `users/${userId}`);
        get(userRef).then(snapshot => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const username = userData.username || userData.email.split('@')[0];
                localStorage.setItem('userId', userId);
                localStorage.setItem('username', username);
                displayPartyMembers(userId);  // Display party members
                fetchPartyInvitations(); // Set up the real-time listener for party invitations
            }
        });
    }
});

