
import IChatUi from './IChatUi.js';
import IWs from './IWs.js';


/**
 * SocialAppMenus class.
 * 
 * This class manages the social menu functionalities within the chat application.
 * It handles the display of social users, their statuses, and interactions via WebSocket.
 * 
 * @class SocialAppMenus
 * @extends IChatUi
 * 
 * @property {string} userId - The unique identifier for the user.
 * @property {Notif} notif - An instance of the Notif class for handling user notifications.
 * @property {Array} socialUsers - An array of social users fetched from the API.
 * @property {IWs} wsSocial - An instance of the WebSocket class for managing social user connections.
 * 
 * @extends IChatUi
 * 
 * @memberof SocialAppMenus
 */
class SocialAppMenus extends IChatUi {


	// ===============================================================================================
	// =========================================== Constructor =======================================
	// ===============================================================================================


	/**
	 * SocialAppMenus class constructor.
	 * 
	 * This constructor initializes the SocialAppMenus instance for managing social interactions
	 * within the application. It sets up the WebSocket connection and fetches social users.
	 * 
	 * @param {string} userId - The unique identifier for the user, used for managing user-specific menus and notifications.
	 * @param {Notif} notif - An instance of the Notif class for handling notifications.
	 * 
	 * @property {string} userId - The unique identifier for the user.
	 * @property {Notif} notif - An instance of the Notif class for handling notifications related to the user.
	 * @property {Array|null} socialUsers - An array containing social users or null if not yet initialized.
	 * @property {IWs|null} wsSocial - An instance of the IWs class for managing WebSocket connections for social interactions.
	 * @property {Function} updateSocialStatusHandler - A handler function bound to update social status.
	 * 
	 * @memberof SocialAppMenus
	 */
	constructor(userId, notif) {
		super();

		this.userId = userId;
		this.notif = notif;
		this.socialUsers = null;
		this.wsSocial = null;

		this.updateSocialStatusHandler = this.updateSocialStatus.bind(this);

		this.init();
	}


	// ===============================================================================================
	// ============================================= INIT ============================================
	// ===============================================================================================


	/**
	 * Initializes the SocialAppMenus instance.
	 * 
	 * This method fetches the list of social users, sets up the WebSocket connection, 
	 * and initializes the social panel.
	 * 
	 * @async
	 * @function init
	 * 
	 * @memberof SocialAppMenus
	 */
	async init() {
		this.socialUsers = await APIgetSocialUsers();

		let roomName = 'social_' + this.userId;
		roomName = await APIgetHashRoom(roomName);
		this.wsSocial = new IWs(roomName.roomName, 'social', (message) => this.processWebSocketMessage(message));
		await this.wsSocial.init();

		await this.innerSocialPannel();
		this.displaySocialPannel();

		this.handleCloseSocialPannel();
		if (this.socialUsers.length > 0) {
			await this.innerSocialUser();
			await APIclearNotifSocial();
			this.notif.updateAllNotif();
			this.handleUpdateStatusUser();
		}
	}


	// ===============================================================================================
	// ======================================= Inner Element =========================================
	// ===============================================================================================


	/**
	 * Sets up the inner social user elements in the social panel.
	 * 
	 * This method fetches the social users and updates the HTML to display their statuses and details.
	 * 
	 * @async
	 * @function innerSocialUser
	 * 
	 * @throws {Error} Logs an error if fetching or updating social users fails.
	 * 
	 * @memberof SocialAppMenus
	 */
	async innerSocialUser() {
		try {
			this.socialUsers = await APIgetSocialUsers();
			let userSocialContainer = document.getElementById('social-list');
			userSocialContainer.innerHTML = this.socialUsers.map(socialUser => `
                <div class="user" id="user-${socialUser.id}">
                    <div class="data">
                        <a href="/profil?username=${socialUser.username}" style="position: relative;">
                            <img class="${socialUser.is_online ? 'online' : 'offline'}" src="${socialUser.img.startsWith('profile_pics/') ? '/media/' + socialUser.img : socialUser.img}" alt="pp">
                            ${socialUser.notif === 1 ? '<i class="fas fa-exclamation mark-notif"></i>' : ''}
                        </a>
                        <span>${socialUser.username}</span>
                    </div>
                    <div class="social-action">
                        <span>${this.getSocialStatus(socialUser)}</span>
                    </div>
                </div>
            `).join('');
		} catch (error) {
			console.error('Failed to innerSocialUser', error);
		}
	}


	// ===============================================================================================
	// ======================================= handle Element =======================================
	// ===============================================================================================


	/**
	 * Sets up the event listener for closing the social panel.
	 * 
	 * This method adds an event listener to the close button, which hides the panel and 
	 * closes the WebSocket connection.
	 * 
	 * @async
	 * @function handleCloseSocialPannel
	 * 
	 * @throws {Error} Logs an error if setting up the close button fails.
	 * 
	 * @memberof SocialAppMenus
	 */
	async handleCloseSocialPannel() {
		try {
			let socialCloseBtn = document.getElementById('social-close-btn');
			socialCloseBtn.addEventListener('click', async () => {
				await APIclearNotifSocial();
				this.notif.updateAllNotif();
				this.hidePanel();
				this.displaySubMenus();
				this.wsSocial.closeWebSocket();
				this.notif.disableNotifSubMenus();
			});
		} catch (error) {
			console.error('Failed to handleCloseSocialPannel', error);
		}
	}

	/**
	 * Sets up event listeners for updating the status of social users.
	 * 
	 * This method adds click event listeners to the social action buttons, allowing users to update their friend statuses.
	 * 
	 * @async
	 * @function handleUpdateStatusUser
	 * 
	 * @throws {Error} Logs an error if setting up the status update listeners fails.
	 * 
	 * @memberof SocialAppMenus
	 */
	async handleUpdateStatusUser() {
		try {
			document.querySelectorAll('.add-friend').forEach(link => {
				if (link.getAttribute('data-status') == '1' || link.getAttribute('data-status') == '3' || link.getAttribute('data-status') == '4') return;
				link.addEventListener('click', this.updateSocialStatusHandler);
			});
		} catch (error) {
			console.error('Failed to handleUpdateStatusUser', error);
		}
	}


	// ===============================================================================================
	// ========================================== Utils  =============================================
	// ===============================================================================================


	/**
	 * Gets the social status of a user.
	 * 
	 * This method returns the HTML for the social status icon based on the user's friend status.
	 * 
	 * @param {Object} user - The social user object containing user information.
	 * @returns {string} The HTML string representing the social status icon and action link.
	 * 
	 * @memberof SocialAppMenus
	 */
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


	/**
	 * Processes incoming WebSocket messages.
	 * 
	 * This method updates the UI for a social user based on the received WebSocket message.
	 * 
	 * @param {Object} message - The message object received via WebSocket.
	 * 
	 * @throws {Error} Logs an error if processing the WebSocket message fails.
	 * 
	 * @memberof SocialAppMenus
	 */
	processWebSocketMessage(message) {
		try {
			if (!message['updateId'] || !message['senderId']) return;
			if (message['senderId'] == this.userId) return;
			this.updateUserSocialUI(message['senderId'], parseInt(message['updateId']) + 1);
		} catch (error) {
			console.error('Failed to processWebSocketMessage', error);
		}
	}

	/**
	 * Retrieves the room information for a social user.
	 *
	 * @param {string} socialUserId - The unique identifier for the social user.
	 * @returns {Promise<Object>} A promise that resolves to the room information.
	 * @throws Will log an error if the retrieval fails.
	 * 
	 * @memberof SocialAppMenus
	 */
	async getSocialUserRoom(socialUserId) {
		return await APIgetHashRoom('social_' + socialUserId);
	}

	/**
	 * Initializes the WebSocket connection for the specified room.
	 *
	 * @param {string} roomName - The name of the room to connect to.
	 * @returns {Promise<IWs>} A promise that resolves to the initialized WebSocket instance.
	 * @throws Will log an error if the WebSocket initialization fails.
	 * 
	 * @memberof SocialAppMenus
	 */
	async initializeWebSocket(roomName) {
		const wsToUser = new IWs(roomName, 'social', (message) => this.processWebSocketMessage(message));
		await wsToUser.init();

		await this.waitForOpenSocket(wsToUser);

		return wsToUser;
	}

	/**
	 * Waits for the WebSocket to be open before resolving.
	 *
	 * @param {IWs} ws - The WebSocket instance to check.
	 * @returns {Promise<void>} A promise that resolves when the WebSocket is open.
	 * @throws Will reject if there is an error opening the WebSocket.
	 * 
	 * @memberof SocialAppMenus
	 */
	async waitForOpenSocket(ws) {
		return new Promise((resolve, reject) => {
			if (ws.ws.readyState === WebSocket.OPEN) {
				resolve();
			} else {
				ws.ws.addEventListener('open', resolve);
				ws.ws.addEventListener('error', reject);
			}
		});
	}

	/**
	 * Sends a status update through the WebSocket.
	 *
	 * @param {IWs} wsToUser - The WebSocket instance used to send the update.
	 * @param {string} friendStatus - The current friend status to be sent.
	 * @returns {Promise<void>} A promise that resolves when the status is sent.
	 * 
	 * @memberof SocialAppMenus
	 */
	async sendStatusUpdate(wsToUser, friendStatus) {
		wsToUser.sendToWebSocket({
			'updateId': friendStatus,
			'senderId': this.userId
		});

		setTimeout(() => {
			wsToUser.closeWebSocket();
		}, 1000);
	}

	/**
	 * Updates the social status of a user when triggered by an event.
	 *
	 * This function retrieves the user's ID and current status, initializes
	 * the WebSocket connection, sends the status update, and updates the UI.
	 *
	 * @param {Event} event - The event that triggered the update.
	 * @throws Will log an error if the update fails.
	 * 
	 * @memberof SocialAppMenus
	 */
	async updateSocialStatus(event) {
		try {
			event.preventDefault();
			const link = event.target.closest('a');
			const socialUserId = link.getAttribute('data-id');
			const friendStatus = link.getAttribute('data-status');

			const socialUserRoom = await this.getSocialUserRoom(socialUserId);
			const wsToUser = await this.initializeWebSocket(socialUserRoom.roomName);

			await this.sendStatusUpdate(wsToUser, friendStatus);

			await APIupdateSocialStatus(socialUserId, friendStatus);
			this.updateUserSocialUI(socialUserId, friendStatus);
		} catch (error) {
			console.error('Failed to update social status:', error);
		}
	}

	/**
	 * Updates the UI for a specific social user based on their friend status.
	 * 
	 * @param {string} socialUserId - The unique identifier for the social user.
	 * @param {number} friendStatus - The updated friend status.
	 * 
	 * @throws {Error} Logs an error if updating the user UI fails.
	 * 
	 * @memberof SocialAppMenus
	 */
	async updateUserSocialUI(socialUserId, friendStatus) {
		try {
			let userBox = document.getElementById(`user-${socialUserId}`);
			if (!userBox) return;

			let userToUpdate = userBox.querySelector('.add-friend');
			if (!userToUpdate) return;

			userToUpdate.attributes['data-status'].value = parseInt(friendStatus) + 1;
			userToUpdate.innerHTML = this.getUdateStatus(parseInt(friendStatus) + 1);

			userToUpdate.removeEventListener('click', this.updateSocialStatusHandler);
			this.handleUpdateStatusUser();
		} catch (error) {
			console.error('Failed to updateUserSocialUI', error);
		}
	}

	/**
	 * Gets the updated status icon based on the friend's status.
	 * 
	 * @param {number} friend_status - The friend's current status.
	 * @returns {string} The HTML string representing the updated status icon.
	 * 
	 * @memberof SocialAppMenus
	 */
	getUdateStatus(friend_status) {
		const statusIcons = {
			4: '<i class="fa-regular fa-paper-plane"></i>',
			3: '<i class="fa-regular fa-paper-plane"></i>',
			2: '<i class="fa-solid fa-user-plus"></i>',
			1: '<i class="fa-solid fa-hourglass-start"></i>',
			0: '<i class="fa-solid fa-plus"></i>',
			'-1': '<i class="fa-solid fa-user-slash"></i>',
		};
		return statusIcons[friend_status] || '';
	}

}

export default SocialAppMenus;