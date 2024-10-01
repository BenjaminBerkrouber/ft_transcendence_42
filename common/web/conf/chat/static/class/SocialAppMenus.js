
import IChatUi from './IChatUi.js';

class SocialAppMenus extends IChatUi {
    constructor(userId, user, socialUsers) {
        super();

        this.userId = userId;
        this.user = user;
        this.socialUsers = socialUsers;
        this.wsSocial = null;
        this.init();
    }

    async init() {
        console.log('user : ', this.user);
        let roomName = 'social_' + this.userId;
        roomName = await APIgetHashRoom(roomName);
        this.wsSocial = await connectSocialWebSocket(roomName.roomName);
        
        await this.innerSocialPannel();
        
        // une des deux a remove
        this.displaySocialPannel();
        this.handleOpenSocialPannel();


        this.handleCloseSocialPannel(this.wsSocial);
        if (this.socialUsers.length > 0) {
            this.innerSocialUser(this.socialUsers);
            this.handleUpdateStatusUser();
        }
        // APIclearNotifSocial();
        // await updateAllNotif();
    }


    // ===============================================================================================
    // ======================================= Inner Element =========================================
    // ===============================================================================================


    async innerSocialPannel() {
        try {
            const socialMenu = document.getElementById('pannel');
            socialMenu.innerHTML = `
                <div id="social-container">
                    <div id="social-panel">
                        <div id="social-header">
                            <div class="social-head-info">
                                <a href="/profil/"></a>
                                <h3>${this.user.username}</h3>
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
    
    async innerSocialUser() {
        try {
            const userContainer = document.querySelector('#profile-info .profile-info-item');
            userContainer.innerHTML = this.socialUsers.map(user => `
                <div class="user">
                    <div class="data">
                        <a href="/visited_profil/${user.username}/" style="position: relative;">
                            <img class="${user.is_online ? 'online' : 'offline'}" src="${user.img.startsWith('profile_pics/') ? '/media/' + user.img : user.img}" alt="pp">
                            ${user.notif === 1 ? '<i class="fas fa-exclamation mark-notif"></i>' : ''}
                        </a>
                        <span>${user.username}</span>
                    </div>
                    <div class="social-action">
                        <span>
                            ${this.getSocialStatus(user)}
                        </span>
                    </div>
                </div>
            `).join('');
            const anchors = userContainer.querySelectorAll('a');
            anchors.forEach(anchor => {
                console.log(anchor);
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
            console.error('Failed to innerSocialUser', error);
        }
    }


    // ===============================================================================================
    // ======================================= Display Element =======================================
    // ===============================================================================================


    async displaySocialPannel() {
        try {
            const socialMenu = document.getElementById('pannel');
            socialMenu.classList.add('active');
        } catch (error) {
            console.error('Failed to displaySocialMenus', error);
        }
    }

    async handleOpenSocialPannel() {
        try {
            const socialContainer = document.getElementById('social-container');
            socialContainer.classList.add('active');
        } catch (error) {
            console.error('Failed to handleOpenSocialPannel', error);
        }
    }

    // ===============================================================================================
    // ======================================= Hide Element =======================================
    // ===============================================================================================


    // ===============================================================================================
    // ======================================= handle Element =======================================
    // ===============================================================================================


    async handleCloseSocialPannel() {
        try {
            const socialCloseBtn = document.getElementById('social-close-btn');
            socialCloseBtn.addEventListener('click', async () => {
                await APIclearNotifSocial();
                // await updateAllNotif();
                this.hidePanel();
                this.displaySubMenus();
                // disableNotifSubMenus();
                disconnectSocialWebSocket(this.wsSocial);
            });
        } catch (error) {
            console.error('Failed to handleCloseSocialPannel', error);
        }
    }

    async handleUpdateStatusUser() {
        try {
            document.querySelectorAll('.add-friend').forEach(link => {
                if (link.getAttribute('disable') === '') {
                    console.log('You can\'t update this user');
                    return;
                }
                link.addEventListener('click', updateSocialStatus);
            });
        } catch (error) {
            console.error('Failed to handleUpdateStatusUser', error);
        }
    }


    getSocialStatus(user) {
        const statusIcons = {
            3: '<i class="fa-regular fa-paper-plane"></i>',
            2: '<i class="fa-solid fa-user-plus"></i>',
            1: '<i class="fa-solid fa-hourglass-start"></i>',
            0: '<i class="fa-solid fa-plus"></i>',
            '-1': '<i class="fa-solid fa-user-slash"></i>',
        };
        
        const icon = statusIcons[user.friend_status] || '';
        if (icon == '<i class="fa-solid fa-hourglass-start"></i>' || icon == '<i class="fa-regular fa-paper-plane"></i>')
            return `<a href="#" class="add-friend" data-id="${user.id}" data-status="${user.friend_status}" disable>${icon}</a>`;
        return `<a href="#" class="add-friend" data-id="${user.id}" data-status="${user.friend_status}">${icon}</a>`;
    }
}

export default SocialAppMenus;