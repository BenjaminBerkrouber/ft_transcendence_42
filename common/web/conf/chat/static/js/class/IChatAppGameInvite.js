/**
 * IChatAppGameInvite class.
 * 
 * This class manages the functionalities related to game invitations within the chat application.
 * It handles sending game invites, responding to invites, and updating the invite status in the chat.
 * The class provides a structured way to manage game interactions between users.
 * 
 * @class IChatAppGameInvite
 * 
 * @property {Array} messages - The list of chat messages associated with the game invites.
 * @property {number} userId - The ID of the current user interacting with the game invites.
 * @property {number} contactId - The ID of the contact involved in the game invite.
 * @property {Object} wsChat - The WebSocket connection instance for real-time game invite functionality.
 * 
 * @memberof IChatAppGameInvite
 */
class IChatAppGameInvite {


	// ===============================================================================================
	// =========================================== Constructor =======================================
	// ===============================================================================================


	/**
	 * IChatAppGameInvite class constructor.
	 * 
	 * Initializes the IChatAppGameInvite instance with messages, user ID, contact ID, 
	 * and WebSocket connection. This constructor sets up the initial state for the 
	 * game invitations and calls the initialization method to prepare the chat 
	 * interface for user interactions related to game invites.
	 * 
	 * @constructor
	 * @param {Array} messages - The list of chat messages associated with the game invites.
	 * @param {number} userId - The ID of the current user interacting with the game invites.
	 * @param {number} contactId - The ID of the contact involved in the game invite.
	 * @param {Object} wsChat - The WebSocket connection instance for real-time game invite functionality.
	 * 
	 * @property {Array} messages - The list of chat messages associated with the game invites.
	 * @property {number} userId - The ID of the current user interacting with the game invites.
	 * @property {number} contactId - The ID of the contact involved in the game invite.
	 * @property {Object} wsChat - The WebSocket connection instance for real-time game invite functionality.
	 * 
	 * @memberof IChatAppGameInvite
	 */
	constructor(messages, userId, contactId, wsChat) {
		this.messages = messages;
		this.userId = userId;
		this.contactId = contactId;
		this.wsChat = wsChat;
		this.init();
	}


	// ===============================================================================================
	// ============================================= INIT ============================================
	// ===============================================================================================


	/**
	 * Initializes the game invite handlers and sets up event listeners.
	 * 
	 * This method sets up event handlers for sending game invites and responding to 
	 * game invites. If an error occurs during initialization, it logs the error in the console.
	 * 
	 * @async
	 * @function init
	 * 
	 * @throws {Error} Logs an error if initializing game invite handlers fails.
	 * 
	 * @memberof IChatAppGameInvite
	 */
	async init() {
		try {
			this.handlersSendGameInvite();
			this.handlersInviteResp();
		} catch (error) {
			console.error('Failed to init IChatAppGameInvite:', error);
		}
	}


	// ===============================================================================================
	// ======================================= handle Element =======================================
	// ===============================================================================================


	/**
	 * Initializes the event handler for sending game invites.
	 * 
	 * This method sets up a click event listener for the invite button. If an error occurs 
	 * while setting up the event handler, it logs the error in the console.
	 * 
	 * @async
	 * @function handlersSendGameInvite
	 * 
	 * @throws {Error} Logs an error if setting up the send game invite handler fails.
	 * 
	 * @memberof IChatAppGameInvite
	 */
	async handlersSendGameInvite() {
		try {
			let inviteBtn = document.getElementById('invite-btn');

			inviteBtn.addEventListener('click', async () => {
				try {
					let reps = await APIsendGameInvite(this.userId, this.contactId);
					if (reps.status === 205)
						return this.errorInviteHandler();
					this.wsChat.sendToWebSocket({
						message: 'Game invite',
						senderId: this.userId,
						contactId: this.contactId
					});
					this.removeGameInvites();
					this.addGameInviteToChat('<span>Pending</span>', 'my-message');
				} catch (error) {
					this.errorInviteHandler();
				}
			});
		} catch (error) {
			console.error('Failed to handlersSendGameInvite:', error);
		}
	}

	/**
	   * Handles incoming WebSocket messages related to game invites.
	 * 
	 * This method processes incoming game invite messages and updates the UI accordingly.
	 * If the message indicates a game invite, it displays buttons for accepting or declining the invite.
	 * 
	 * @async
	 * @function handlersWsGameInvite
	 * @param {string} message - The incoming message content.
	 * @param {number} senderId - The ID of the sender.
	 * 
	 * @throws {Error} Logs an error if processing the WebSocket game invite fails.
	 * 
	 * @memberof IChatAppGameInvite
	 */
	async handlersWsGameInvite(message, senderId) {
		try {
			if (senderId === this.userId) return;

			if (message === 'Game invite') {
				this.removeGameInvites();
				this.addGameInviteToChat('<button class="btn btn-update" data-tooltip="Accept game"><i id="accept-btn" class="fa-solid fa-check"></i></button><button class="btn btn-update" data-tooltip="Refuse game"><i id="decline-btn" class="fa-solid fa-xmark"></i></button>', 'their-message');
			} else if (message === 'Game accepted') {
				this.updateInviteStatusUI('<button id="join-btn" class="btn btn-join" data-tooltip="Join lobby">Join</button>');
			} else if (message === 'Game declined') {
				this.updateInviteStatusUI('<span>Declined</span>');
			}
			this.handlersInviteResp();
		} catch (error) {
			console.error('Failed to handlersWsGameInvite:', error);
		}
	}

	/**
	 * Initializes the handlers for invite responses.
	 * 
	 * This method sets up event listeners for accepting or declining game invites. If an 
	 * error occurs while setting up the response handlers, it logs the error in the console.
	 * 
	 * @async
	 * @function handlersInviteResp
	 * 
	 * @throws {Error} Logs an error if initializing invite response handlers fails.
	 * 
	 * @memberof IChatAppGameInvite
	 */
	async handlersInviteResp() {
		try {
			this.handleAcceptInvite();
			this.handleDeclineInvite();
			this.handleJoinLobby();
		} catch (error) {
			console.error('Failed to handle invite response:', error);
		}
	}

	/**
	 * Handles the acceptance of a game invite.
	 * 
	 * This method sets up an event listener for the accept button and sends the 
	 * acceptance status through the API and WebSocket. If an error occurs during 
	 * this process, it logs the error in the console.
	 * 
	 * @async
	 * @function handleAcceptInvite
	 * 
	 * @throws {Error} Logs an error if handling the accept invite fails.
	 * 
	 * @memberof IChatAppGameInvite
	 */
	async handleAcceptInvite() {
		try {
			let btnAccept = document.getElementById('accept-btn');
	
			if (!btnAccept) return;
			btnAccept.addEventListener('click', async () => {
				const resp = await APIupdateInviteStatus(this.userId, this.contactId, 2);
				if (resp.status === 205)
					return this.errorInviteHandler();
				this.updateInviteStatusUI('<button id="join-btn" class="btn btn-join" data-tooltip="Join lobby">Join</button>');
				this.handlersInviteResp();
				this.wsChat.sendToWebSocket({
					message: 'Game accepted',
					senderId: this.userId,
					contactId: this.contactId
				});
			});
		} catch (error) {
			console.error('Failed to handleAcceptInvite:', error);
		}
	}

	/**
	 * Handles the decline of a game invite.
	 * 
	 * This method sets up an event listener for the decline button and sends the 
	 * decline status through the API and WebSocket. If an error occurs during 
	 * this process, it logs the error in the console.
	 * 
	 * @async
	 * @function handleDeclineInvite
	 * 
	 * @throws {Error} Logs an error if handling the decline invite fails.
	 * 
	 * @memberof IChatAppGameInvite
	 */
	async handleDeclineInvite() {
		try {
			let btnDecline = document.getElementById('decline-btn');
	
			if (!btnDecline) return;
			btnDecline.addEventListener('click', async () => {
				const resp = await APIupdateInviteStatus(this.userId, this.contactId, -1);
				if (resp.status === 205)
					return this.errorInviteHandler();
				this.updateInviteStatusUI('<span>Declined</span>');
				this.wsChat.sendToWebSocket({
					message: 'Game declined',
					senderId: this.userId,
					contactId: this.contactId
				});
			});
		}  catch (error) {
			console.error('Failed to handleDeclineInvite:', error);
		}
	}

	/**
	 * Handles joining the game lobby.
	 * 
	 * This method sets up an event listener for the join button that navigates 
	 * the user to the game lobby. If an error occurs during this process, it logs 
	 * the error in the console.
	 * 
	 * @async
	 * @function handleJoinLobby
	 * 
	 * @throws {Error} Logs an error if handling the join lobby action fails.
	 * 
	 * @memberof IChatAppGameInvite
	 */
	async handleJoinLobby() {
		let btnJoin = document.getElementById('join-btn');

		if (!btnJoin) return;
		btnJoin.addEventListener('click', async () => {
			console.info('Join lobby PongPrivGame');
		});
	}


	// ===============================================================================================
	// ================================= Utils Update invite status ==================================
	// ===============================================================================================


	/**
	 * Updates the UI to reflect the invite status.
	 * 
	 * This method updates the chat UI with the provided invite status message. 
	 * It replaces any existing game invite messages with the new status.
	 * 
	 * @function updateInviteStatusUI
	 * @param {string} statusMessage - The message to display the current invite status.
	 * 
	 * @memberof IChatAppGameInvite
	 */
	async updateInviteStatusUI(statusElement) {
		try {
			let gameInviteBOx = document.getElementById('game-invite');
			if (!gameInviteBOx) return;
			let element = gameInviteBOx.getElementsByClassName('choose-games')[0];
			element.innerHTML = statusElement;
		} catch (error) {
			console.error('Failed to updateInviteStatusUI:', error);
		}
	}


	// ===============================================================================================
	// ==================================== Utils Message Handlers ===================================
	// ===============================================================================================


	/**
	 * Removes any existing game invite messages from the chat.
	 * 
	 * This method finds and removes the game invite messages from the chat interface 
	 * to ensure only the latest invite status is displayed.
	 * 
	 * @function removeGameInvites
	 * 
	 * @memberof IChatAppGameInvite
	 */
	async removeGameInvites() {
		let chatMessages = document.getElementById('chat-messages');
		let gameInvites = chatMessages.getElementsByClassName('game-invite');
		while (gameInvites[0]) {
			gameInvites[0].parentNode.removeChild(gameInvites[0]);
		}
	}

	/**
	 * Adds a game invite message to the chat.
	 * 
	 * This method creates and appends a new game invite message to the chat UI.
	 * 
	 * @function addGameInviteToChat
	 * @param {string} message - The message content to display.
	 * @param {string} messageType - The type of the message (e.g., 'my-message', 'their-message').
	 * 
	 * @memberof IChatAppGameInvite
	 */
	async addGameInviteToChat(statusElement, messageSendBy) {
		const chatMessages = document.getElementById('chat-messages');
		const msgDiv = document.createElement('div');
		msgDiv.className = `message ${messageSendBy} game-invite`;
		msgDiv.id = 'game-invite';
		msgDiv.innerHTML = `
			<div class="game-invite-head">
				<img src="https://d1tq3fcx54x7ou.cloudfront.net/uploads/store/tenant_161/download/366/image/large-041f064dd94c96b097973e5d41a9c45f.jpg" alt="game-inv-img">
			</div>
			<div class="choose-games">
				${statusElement}
			</div>
		`;
		chatMessages.appendChild(msgDiv);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}


	// ===============================================================================================
	// ======================================= Utils Error  ==========================================
	// ===============================================================================================


	/**
	 * Handles the error state of game invites.
	 * 
	 * This method removes any existing game invites from the chat and displays 
	 * an error message indicating that an issue occurred with the game invite. 
	 * It creates a new error message element and appends it to the chat messages 
	 * container, ensuring the chat view scrolls to the latest message.
	 * 
	 * @async
	 * @function errorInviteHandler
	 * 
	 * @memberof IChatAppGameInvite
	 */
	async errorInviteHandler() {
		this.removeGameInvites();
		this.removeGameInvitesError();
		let chatMessages = document.getElementById('chat-messages');
		const parentDiv = document.createElement('div');
		parentDiv.classList.add('error-parent-invite');
		parentDiv.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="color: #ff0000;"></i>';
		parentDiv.innerHTML += this.createErrorMessageDiv();
		chatMessages.appendChild(parentDiv);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}

	/**
	 * Creates an error message element for game invites.
	 * 
	 * This method returns a string of HTML representing an error message for game invites. 
	 * It includes an image and a title indicating that an error has occurred. This string 
	 * can be used to append to the chat UI to notify users of an issue.
	 * 
	 * @function createErrorMessageDiv
	 * @returns {string} HTML string representing the error message element.
	 * 
	 * @memberof IChatAppGameInvite
	 */
	createErrorMessageDiv() {
		return `
			<div class="message error-message game-invite">
				<div class="game-invite-head">
					<img src="https://d1tq3fcx54x7ou.cloudfront.net/uploads/store/tenant_161/download/366/image/large-041f064dd94c96b097973e5d41a9c45f.jpg" alt="game-inv-img">
				</div>
				<div class="choose-games">
					<span>Error</span>
				</div>
			</div>
		`;
	}

	/**
	 * Removes existing game invite error messages from the chat.
	 * 
	 * This method finds and removes any existing error messages related to game invites
	 * from the chat interface. It ensures that only the latest error message is displayed.
	 * 
	 * @async
	 * @function removeGameInvitesError
	 * 
	 * @memberof IChatAppGameInvite
	 */
	async removeGameInvitesError() {
		try {
			let chatMessages = document.getElementById('chat-messages');
			let gameInvites = chatMessages.getElementsByClassName('error-parent-invite');
			while (gameInvites[0]) {
				gameInvites[0].parentNode.removeChild(gameInvites[0]);
			}
		} catch (error) {
			console.error('Failed to removeGameInvitesError:', error);
		}
	}

}

export default IChatAppGameInvite;