// notif.js

// ============================== NOTIF PART ==============================

// ============================= NOTIF update =============================

async function updateAllNotif() {
    try {
        globalNotif = await APIgetGlobalNotif(userId);
        chatNotif = await getChatNotif(globalNotif);
        socialNotif = await getSocialNotif(globalNotif);
        nbrChatNotif = await APIgetNbrChatNotif(userId);
        nbrSocialNotif = await APIgetNbrSocialNotif(userId);
    } catch (error) {
        console.error('Failed to updateAllNotif', error);
    }
}

async function updateNotifChat() {
    try {
        nbrChatNotif = await APIgetNbrChatNotif(userId);
    } catch (error) {
        console.error('Failed to updateNotifChatSocial', error);
    }
}

async function updateNotifSocial() {
    try {
        nbrSocialNotif = await APIgetNbrSocialNotif(userId);
    } catch (error) {
        console.error('Failed to updateNotifChatSocial', error);
    }
}


// =========================== NOTIF display ===========================


async function displayNotifMenusChat() {
    try {
        if (nbrChatNotif == 0)
            return ;
        let notifChatBox = document.getElementById('notif-chat');
        notifChatBox.classList.add('active');
    } catch (error) {
        console.error('Failed to displayNotifMenusChat', error);
    }
}

async function displayNotifMenusSocial() {
    try {
        if (nbrSocialNotif == 0)
            return ;
        let notifChatBox = document.getElementById('notif-social');
        notifChatBox.classList.add('active');
    } catch (error) {
        console.error('Failed to displayNotifMenusChat', error);
    }
}

async function disableNotifSubMenus() {
    try {
        displayNotifMenusChat();
        displayNotifMenusSocial();
    } catch (error) {
        console.error('Failed to disableNotifChatSocial', error);
    }
}

async function disableNotifMenus() {
    try {
        // if (globalNotif == 0)
        //     return ;
        // let boxNbrNotif = document.getElementById('gl-notif-nbr');
        // boxNbrNotif.innerHTML = globalNotif.length;
        // let boxGlobalNotif = document.getElementById('global-notif');
        // boxGlobalNotif.classList.add('active');
    } catch (error) {
        console.error('Failed to disableNotifMenus', error);
    }
}

// =========================== NOTIF hide ===========================

async function hideNotifMenusChat() {
    try {
        let notifChatBox = document.getElementById('notif-chat');
        notifChatBox.classList.remove('active');
    } catch (error) {
        console.error('Failed to hideNotifMenusChat', error);
    }
}

async function hideNotifMenusSocial() {
    try {
        let notifSocialBox = document.getElementById('notif-social');
        notifSocialBox.classList.remove('active');
    } catch (error) {
        console.error('Failed to hideNotifMenusSocial', error);
    }
}

async function hideNotifMenus() {
    try {
        let boxGlobalNotif = document.getElementById('global-notif');
        boxGlobalNotif.classList.remove('active');
    } catch (error) {
        console.error('Failed to hideNotifMenus', error);
    }
}



// async function hideNotifSubMenus() {
//     try {
//         let notifChatBox = document.getElementById('notif-chat');
//         notifChatBox.classList.remove('active');
//         let notifSocialBox = document.getElementById('notif-social');
//         notifSocialBox.classList.remove('active');
//     } catch (error) {
//         console.error('Failed to hideNotifSubMenus', error);
//     }
// }


// =========================== NOTIF get ===========================

async function getSocialNotif() {
    return new Promise(async (resolve, reject) => {
        let socialNotif = globalNotif;
        socialNotif.forEach((notif) => { 
            if (notif.type === 3 || notif.type === 4)
                return notif;
        });
        resolve(socialNotif);
    });
}

async function getChatNotif() {
    return new Promise(async (resolve, reject) => {
        let chatNotif = globalNotif;
        chatNotif.forEach((notif) => { 
            if (notif.type === 1 || notif.type === 2)
                return notif;
        });
        resolve(chatNotif);
    });
}
