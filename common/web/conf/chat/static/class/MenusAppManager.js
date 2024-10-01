import IChatUi from './IChatUi.js';
import ChatAppMenus from "./ChatAppMenus.js";
import SocialAppMenus from "./SocialAppMenus.js";

class MenusAppManager extends IChatUi {
	constructor(userId) {
		super();

		this.userId = userId;
		this.isUserAuthenticated = getCookie('isUserAuthenticated');
		this.boolChat = true;
		this.notifChat = 0;
		this.notifSocial = 0;
		this.nbrChatNotif = 0;
		this.nbrSocialNotif = 0;
		this.init();
	}

	init() {
		if (this.isUserAuthenticated === 'false') return;

		let inter = setInterval(async function () {
			if (typeof APIgetCurrentUser !== 'undefined') {
				clearInterval(inter);
			}
		}, 100);

		// await updateAllNotif();
		this.displayMenus();
		// disableNotifMenus();
		let menus = document.getElementById('pre-menu-btn');

		menus.addEventListener('click', () => this.handleRadialMenu());
	}


	// ===============================================================================================
	// ======================================= Inner Element =========================================
	// ===============================================================================================


	async innerSubMenus() {
		try {
			let radialMenu = document.getElementById('radial-menu');
			radialMenu.innerHTML = `
                <div id="chat-panel-btn">
                    <i id="chat-btn" class="fas fa-comment-alt"></i>
                    <div id="notif-chat" class="notif notif-count">
                        <span>${this.nbrChatNotif}</span>
                    </div>
                </div>
                <div id="social-panel-btn">
                    <i id="social-btn" class="fas fa-user"></i>
                    <div id="notif-social" class="notif notif-count">
                        <span>${this.nbrSocialNotif}</span>
                    </div>
                </div>
            `;
		} catch (error) {
			console.error('Failed to innerSubMenus', error);
		}
	}

	// ===============================================================================================
	// ======================================= handle Element =======================================
	// ===============================================================================================


	async handleRadialMenu() {
		try {
			let radialMenu = document.getElementById('radial-menu');

			if (radialMenu.classList.contains('active')) {

				// await updateAllNotif();
				this.hideSubMenus();
				// disableNotifMenus();

			} else {

				// hideNotifMenus();
				await this.innerSubMenus();
				await this.displaySubMenus();

				// disableNotifSubMenus();
				if (this.boolChat) {
					radialMenu.addEventListener('click', async (e) => {
						if (e.target.id === 'chat-btn') {

							const chatAppMenus = new ChatAppMenus(this.userId, await APIgetChatUsers());
							// hideNotifSubMenus();
						} else if (e.target.id === 'social-btn') {
							const socialAppMenus = new SocialAppMenus(this.userId, await APIgetCurrentUser(), await APIgetSocialUsers());
							// hideNotifSubMenus();
						}
					});
					this.boolChat = false;
				}
			}
		} catch (error) {
			console.error('Failed to handleRadialMenu', error);
		}
	}

}

export default MenusAppManager;