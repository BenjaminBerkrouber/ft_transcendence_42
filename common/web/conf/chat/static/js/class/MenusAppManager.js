import IChatUi from './IChatUi.js';
import ChatAppMenus from "./ChatAppMenus.js";
import SocialAppMenus from "./SocialAppMenus.js";
import Notif from './Notif.js';


/**
 * MenusAppManager class.
 * 
 * This class manages the display and functionality of chat and social menus in the application.
 * It handles user notifications, menu interactions, and the initialization of inner submenus for 
 * different functionalities (chat and social).
 * 
 * @class MenusAppManager
 * @extends IChatUi
 * 
 * @property {string} userId - The unique identifier for the user.
 * @property {Notif} notif - An instance of the Notif class for handling user notifications.
 * @property {string} isUserAuthenticated - Indicates the user's authentication status retrieved from a cookie.
 * @property {boolean} boolChat - A flag to track if chat functionality is enabled.
 * 
 * @extends IChatUi
 * 
 * @memberof MenusAppManager
 */
class MenusAppManager extends IChatUi {


	// ===============================================================================================
	// =========================================== Constructor =======================================
	// ===============================================================================================


    /**
     * MenusAppManager class constructor.
     * 
     * This constructor initializes the MenusAppManager instance for managing chat and social menus
     * within the application. It sets up notifications and checks the user's authentication status.
     * 
     * @param {string} userId - The unique identifier for the user, used for managing user-specific menus and notifications.
     * 
     * @property {string} userId - The unique identifier for the user.
     * @property {Notif} notif - An instance of the Notif class for handling notifications related to the user.
     * @property {string} isUserAuthenticated - A string indicating the user's authentication status, retrieved from a cookie.
     * @property {boolean} boolChat - A flag indicating whether the chat functionality is enabled.
     * 
     * @memberof MenusAppManager
     */
	constructor(userId) {
		super();

		this.userId = userId;
		this.notif = new Notif(this.userId);

		this.isUserAuthenticated = getCookie('isUserAuthenticated');
		this.boolChat = true;
		this.init();
	}


	// ===============================================================================================
	// ============================================= INIT ============================================
	// ===============================================================================================


    /**
     * Initializes the MenusAppManager instance.
     * 
     * This method checks if the user is authenticated. If the user is authenticated, it initializes notifications 
     * and sets up the event listeners for the menu button.
     * 
     * @async
     * @function init
     * 
     * @throws {Error} Logs an error if the initialization of notifications fails.
	 * 
     * @memberof MenusAppManager
     */
	async init() {
		if (this.isUserAuthenticated === 'false') return;

		await this.notif.init();

		this.displayMenus();
		this.notif.disableNotifMenus();

		let menus = document.getElementById('pre-menu-btn');
		menus.addEventListener('click', () => this.handleRadialMenu());
	}


	// ===============================================================================================
	// ======================================= Inner Element =========================================
	// ===============================================================================================


    /**
     * Sets up the inner submenu elements within the radial menu.
     * 
     * This method updates the inner HTML of the radial menu with buttons for chat and social menus, 
     * including notification indicators for each.
     * 
     * @async
     * @function innerSubMenus
     * 
     * @throws {Error} Logs an error if updating the inner submenus fails.
	 * 
     * @memberof MenusAppManager
     */
	async innerSubMenus() {
		try {
			let radialMenu = document.getElementById('radial-menu');
			radialMenu.innerHTML = `
                <div id="chat-panel-btn">
                    <i id="chat-btn" class="fas fa-comment-alt"></i>
                    <div id="notif-chat" class="notif notif-count">
                        <span id="notif-chat-cpt"></span>
                    </div>
                </div>
                <div id="social-panel-btn">
                    <i id="social-btn" class="fas fa-user"></i>
                    <div id="notif-social" class="notif notif-count">
                        <span id="notif-social-cpt"></span>
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


    /**
     * Handles the radial menu click event.
     * 
     * This method manages the display of submenus based on the current state of the radial menu.
     * If the menu is already active, it hides submenus and notifications. Otherwise, it displays the 
     * inner submenus and sets up event listeners for button clicks.
     * 
     * @async
     * @function handleRadialMenu
     * 
     * @throws {Error} Logs an error if handling the radial menu fails.
	 * 
     * @memberof MenusAppManager
     */
	async handleRadialMenu() {
		try {
			if (this.isRadialMenuActive()) {
				await this.notif.updateAllNotif();
				this.notif.hideNotifSubMenus();
				await this.hideSubMenus();
				this.notif.disableNotifMenus();
			} else {
				this.notif.hideNotifMenus();
				await this.innerSubMenus();
				await this.displaySubMenus();
				this.notif.disableNotifSubMenus();

				this.handlersMenuClickListener();
			}
		} catch (error) {
			console.error('Failed to handleRadialMenu', error);
		}
	}


	// ===============================================================================================
	// ======================================= handle Element =======================================
	// ===============================================================================================


    /**
     * Sets up click event listeners for menu buttons.
     * 
     * This method adds event listeners to the radial menu buttons for chat and social functionalities.
     * When a button is clicked, it initializes the corresponding menu.
     * 
     * @function handlersMenuClickListener
	 * 
     * @throws {Error} Logs an error if handling the radial menu fails.
	 * 
	 * @memberof MenusAppManager
     */
	handlersMenuClickListener() {
		try {
			let radialMenu = document.getElementById('radial-menu');
	
			if (this.boolChat) {
				radialMenu.addEventListener('click', async (e) => {
					if (e.target.id === 'chat-btn') {
						this.notif.hideNotifSubMenus();
						const chatAppMenus = new ChatAppMenus(this.userId, this.notif);
					} else if (e.target.id === 'social-btn') {
						this.notif.hideNotifSubMenus();
						const socialAppMenus = new SocialAppMenus(this.userId, this.notif);
					}
				});
				this.boolChat = false;
			}
		} catch (error) {
			console.error('Failed to handlersMenuClickListener', error);
		}
	}


	// ===============================================================================================
	// ========================================== Utils  =============================================
	// ===============================================================================================


    /**
     * Checks if the radial menu is currently active.
     * 
     * This method determines whether the radial menu is in the active state by checking the corresponding
     * CSS class on the radial menu element.
     * 
     * @function isRadialMenuActive
     * @returns {boolean} True if the radial menu is active, false otherwise.
	 * 
     * @memberof MenusAppManager
     */
	isRadialMenuActive() {
		return document.getElementById('radial-menu').classList.contains('active');
	}

}

export default MenusAppManager;