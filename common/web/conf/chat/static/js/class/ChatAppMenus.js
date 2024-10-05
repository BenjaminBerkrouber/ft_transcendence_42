
import IChatUi from './IChatUi.js';
import ChatAppChanel from './ChatAppChanel.js';


/**
 * ChatAppMenus class.
 * 
 * This class extends IChatUi and manages the chat menu functionalities within 
 * the chat application. It handles user interactions, displays chat user 
 * information, and manages notifications.
 * 
 * @class ChatAppMenus
 * @extends IChatUi
 * 
 * @property {number} userId - The ID of the user interacting with the chat.
 * @property {Object} notif - The notification manager instance used to manage chat notifications.
 * @property {Array} chatUsers - The list of chat users retrieved from the API.
 * 
 * @memberof ChatAppMenus
 */
class ChatAppMenus extends IChatUi {


	// ===============================================================================================
	// =========================================== Constructor =======================================
	// ===============================================================================================


    /**
     * ChatAppMenus class constructor.
     * 
     * Initializes the ChatAppMenus instance with the user ID and notification manager.
     * 
     * This constructor fetches the list of chat users from the API and calls the 
     * initialization method to set up the chat menus and event handlers.
     * 
     * @constructor
     * @param {number} userId - The ID of the user.
     * @param {Object} notif - The notification manager instance.
     * 
     * @property {number} userId - The ID of the user interacting with the chat.
     * @property {Object} notif - The notification manager instance used to manage chat notifications.
     * @property {Array} chatUsers - The list of chat users retrieved from the API.
     * 
     * @memberof ChatAppMenus
     */
	constructor(userId, notif) {
		super();

		this.userId = userId;
		this.notif = notif;
		this.chatUsers = null;
		this.init();
	}


	// ===============================================================================================
	// ============================================= INIT ============================================
	// ===============================================================================================


    /**
     * Initializes the chat menus and retrieves chat users.
     * 
     * This method fetches the list of chat users by calling the API and sets up the 
     * inner chat menus. It also handles events related to closing chat menus and 
     * user interactions if there are users available in the chat.
     * 
     * @async
     * @function init
     * 
     * @throws {Error} Logs an error if fetching chat users or setting up the menus fails.
     * 
     * @memberof ChatAppMenus
     */
	async init() {
		this.chatUsers = await APIgetChatUsers();

		await this.innerChatMenus();
		this.displayChatMenus();

		this.handleCloseChatMenus();
		if (this.chatUsers.length > 0) {
			await this.innerChatUsers();
			this.handlersContactClick();
		}
	}


	// ===============================================================================================
	// ======================================= Inner Element =========================================
	// ===============================================================================================


	/**
     * Renders the chat users in the chat UI.
     * 
     * This method retrieves chat users and populates the contacts list in the UI.
     * 
     * @async
     * @function innerChatUsers
     * 
     * @throws {Error} Logs an error if fetching chat users fails.
     * 
     * @memberof ChatAppMenus
     */
	async innerChatUsers() {
		try {
			this.chatUsers = await APIgetChatUsers();
			let userChatContainer = document.getElementById('contacts-list');
			userChatContainer.innerHTML = this.chatUsers.map(user => `
                <div class="contact" data-contact-id="${user.id}">
                    <div class="contact-status ${user.is_online ? 'online' : 'offline'}">
                        <a href="/profil?username=${user.username}">
                            <img  src="${user.img.startsWith('profile_pics/') ? '/media/' + user.img : user.img}" class="contact-img" alt="${user.username}">
                            ${user.notif > 0 ? `<span class="mark-notif-chat">+${user.notif}</span>` : ''}
                        </a>
                        <span class="contact-name">${user.username}</span>
                    </div>
                    <div class="contact-online-status ${user.is_online ? 'online' : 'offline'}">
                    </div>
                </div>
            `).join('');
		} catch (error) {
			console.error('Failed to innerChatUsers', error);
		}
	}


	// ===============================================================================================
	// ======================================= handle Element ========================================
	// ===============================================================================================


    /**
     * Handles the close button functionality for chat menus.
     * 
     * This method sets up an event listener for the close button, allowing users 
     * to hide chat menus and update notifications.
     * 
     * @async
     * @function handleCloseChatMenus
     * 
     * @throws {Error} Logs an error if handling the close button fails.
     * 
     * @memberof ChatAppMenus
     */
	async handleCloseChatMenus() {
		try {
			let chatCloseBtn = document.getElementById('close-btn');
			chatCloseBtn.addEventListener('click', async () => {
				this.hidePanel();
				this.displaySubMenus();
				await this.notif.updateAllNotif();
				this.notif.disableNotifSubMenus();
			});
		} catch (error) {
			console.error('Failed to handleCloseChatMenus', error);
		}
	}


    /**
     * Sets up event handlers for contact clicks.
     * 
     * This method adds click event listeners to each contact, initializing a new 
     * chat channel upon clicking a contact.
     * 
     * @async
     * @function handlersContactClick
     * 
     * @throws {Error} Logs an error if setting up contact click handlers fails.
     * 
     * @memberof ChatAppMenus
     */
	async handlersContactClick() {
		try {
			document.querySelectorAll('.contact').forEach(contact => {
				contact.addEventListener('click', async (event) => {
					let contactId = event.target.closest('.contact').getAttribute('data-contact-id');
					new ChatAppChanel(this.userId, contactId, await APIgetUserById(contactId), this.notif);
				});
			});
		} catch (error) {
			console.error('Failed to handlersContactClick', error);
		}
	}

}

export default ChatAppMenus;