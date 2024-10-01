// social.js

// ============================== SOCIAL utils ==============================


function getUdateStatus(friend_status) {
    if (friend_status == 0) {
        return '<i class="fa-solid fa-user-plus"></i>';
    } else if (friend_status == 2) {
        return '<i class="fa-regular fa-paper-plane"></i>';
    } else {
        return '<i class="fa-solid fa-user-plus"></i>';
    }
    
}

// ============================== SOCIAL update ==============================

async function updateUIStatusUserWS(friendStatus, socialUserId) {
    try {
        let userToUpdate = document.querySelector(`.add-friend[data-id="${socialUserId}"]`);
        if (!userToUpdate) {
            return;
        }
        userToUpdate.innerHTML = getUdateStatus(friendStatus);
        userToUpdate.setAttribute('data-status', friendStatus == 0 ? 2 : 3);
    } catch (error) {
        console.error('Failed to updateUIStatusUserWS', error);
    }
}

async function sendUpdateSocialStatusWS(friendStatus, wsToUser) {
    try {
        wsToUser.send(JSON.stringify({
            'updateId': friendStatus,
            'senderId': userId
        }));
    } catch (error) {
        console.error('Error in sendUpdateSocialStatusWS:', error);
    }
}

async function sendToWebSocket(friendStatus, socialUserId) {
    try {
        let userToSendRoom = await APIgetHashRoom('social_' + socialUserId);
        let wsToUser = await connectSocialWebSocket(userToSendRoom.roomName);

        wsToUser.onopen = () => {
            sendUpdateSocialStatusWS(friendStatus, wsToUser);
            setTimeout(() => {
                disconnectSocialWebSocket(wsToUser);
            }, 10000);
        };

        wsToUser.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

    } catch (error) {
        console.error('Error in sendToWebSocket:', error);
    }
}

async function updateSocialStatus(event) {
    try {
        event.preventDefault();
        const link = event.target.closest('a');
        const socialUserId = link.getAttribute('data-id');
        const friendStatus = link.getAttribute('data-status');
        await APIupdateSocialStatus(socialUserId, friendStatus);
        sendToWebSocket(friendStatus, socialUserId);
        updateUserSocialUI(socialUserId, friendStatus);
    } catch (error) {
        console.error('Failed to update social status:', error);
    }
}

async function updateUserSocialUI(socialUserId, friendStatus) {
    try {
        const socialUsers = await APIgetSocialUsers();
        innerSocialUser(socialUsers);
        handleUpdateStatusUser();
    } catch (error) {
        console.error('Failed to updateUserSocialUI', error);
    }
}

// ============================== SOCIAL display ==============================


async function displaySocialPannel() {
    try {
        const socialMenu = document.getElementById('pannel');
        socialMenu.classList.add('active');
    } catch (error) {
        console.error('Failed to displaySocialMenus', error);
    }
}

// ============================== SOCIAL hide ==============================

async function hidePanel() {
    try {
        const pannel = document.getElementById('pannel');
        pannel.classList.remove('active');
        pannel.innerHTML = '';
    } catch (error) {
        console.error('Failed to hideSocialMenus', error);
    }
}

// ============================== SOCIAL inner ==============================

async function innerSocialPannel() {
    try {

        let user = [];
        user = await APIgetCurrentUser();
        user = user.user;

        const socialMenu = document.getElementById('pannel');
        socialMenu.innerHTML = `
            <div id="social-container">
                <div id="social-panel">
                    <div id="social-header">
                        <div class="social-head-info">
                            <a href="/profil/"></a>
                            <h3>${user.username}</h3>
                            <button id="social-close-btn" class="btn btn-link"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                    </div>
                    <div id="profile-info">
                        <div id="profile-info">
                            <div class="profile-info-item"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        const anchors = document.getElementById("social-header").querySelectorAll('a');
        anchors.forEach(anchor => {
            anchor.addEventListener('click', async (event) => {
                event.preventDefault();
                let href = event.currentTarget.href;
                htmx.ajax('GET', href, {
                    target: '#main-content',
                    swap: 'innerHTML',
                }).then(response => {
                    history.pushState({}, '', href);
                });
            });
        });
    } catch (error) {
        console.error('Failed to innerSocialMenus', error);
    }
}


// ============================== SOCIAL handle ==============================

async function handleCloseSocialPannel(ws) {
    try {
        const socialCloseBtn = document.getElementById('social-close-btn');
        socialCloseBtn.addEventListener('click', async function () {
            hidePanel();
            displaySubMenus();
            disableNotifSubMenus();
            APIclearNotifSocial();
            await updateAllNotif();
            disconnectSocialWebSocket(ws);
        });
    } catch (error) {
        console.error('Failed to handleCloseSocialPannel', error);
    }
}

// ============================== SOCIAL toggle ==============================
