import IChatAppMessage from './IChatAppMessage.js';
import IChatUi from './IChatUi.js';
import IChatAppGameInvite from './IChatAppGameInvite.js';
import IWs from './IWs.js';


/**
 * ChatAppChanel class.
 * 
 * This class manages the chat channel between users. It handles user messages, 
 * WebSocket connections for real-time communication, and user interface updates 
 * for the chat panel.
 * 
 * @class ChatAppChanel
 * @extends IChatUi
 * 
 * @property {string} userId - The unique identifier for the user.
 * @property {Notif} notif - An instance of the Notif class for handling notifications.
 * @property {string} contactId - The unique identifier for the contact user in the chat.
 * @property {Object} contactUser - An object representing the contact user's information.
 * @property {Array|null} userMsg - An array of messages exchanged with the contact, initialized as null.
 * @property {IWs|null} wsChat - An instance of IWs for managing WebSocket communication, initialized as null.
 * @property {IChatAppMessage|null} IChatAppMessage - An instance of IChatAppMessage for managing chat messages, initialized as null.
 * @property {IChatAppGameInvite|null} IChatAppGameInvite - An instance of IChatAppGameInvite for managing game invitations, initialized as null.
 * 
 * @memberof ChatAppChanel
 */
class ChatAppChanel extends IChatUi {


	// ===============================================================================================
	// =========================================== Constructor =======================================
	// ===============================================================================================


	/**
	 * ChatAppChanel class constructor.
	 * 
	 * This constructor initializes the ChatAppChanel instance for managing the chat 
	 * channel with a specific contact. It sets up user IDs, notifications, and initializes 
	 * the WebSocket connection for real-time messaging.
	 * 
	 * @param {string} userId - The unique identifier for the user.
	 * @param {string} contactId - The unique identifier for the contact user in the chat.
	 * @param {Object} contactUser - An object representing the contact user's information.
	 * @param {Notif} notif - An instance of the Notif class for handling notifications related to chat.
	 * 
	 * @property {string} userId - The unique identifier for the user.
	 * @property {Notif} notif - An instance of the Notif class for handling notifications related to chat.
	 * @property {string} contactId - The unique identifier for the contact user in the chat.
	 * @property {Object} contactUser - An object representing the contact user's information.
	 * @property {Array|null} userMsg - An array of messages exchanged with the contact, initialized as null.
	 * @property {IWs|null} wsChat - An instance of IWs for managing WebSocket communication, initialized as null.
	 * @property {IChatAppMessage|null} IChatAppMessage - An instance of IChatAppMessage for managing chat messages, initialized as null.
	 * @property {IChatAppGameInvite|null} IChatAppGameInvite - An instance of IChatAppGameInvite for managing game invitations, initialized as null.
	 * 
	 * @memberof ChatAppChanel
	 */
	constructor(userId, contactId, contactUser, notif) {
		super();

		this.userId = userId;
		this.notif = notif;
		this.contactId = contactId;
		this.contactUser = contactUser;

		this.userMsg = null;
		this.wsChat = null;

		this.IChatAppMessage = null;
		this.IChatAppGameInvite = null;
		this.init();
	}


	// ===============================================================================================
	// ============================================= INIT ============================================
	// ===============================================================================================


	/**
	 * Initializes the chat channel.
	 * 
	 * This method fetches the messages exchanged with the contact, sets up the chat interface,
	 * initializes WebSocket for real-time messaging, and manages instances of IChatAppMessage
	 * and IChatAppGameInvite.
	 * 
	 * @async
	 * @function init
	 * 
	 * @throws {Error} Logs an error if initialization of the chat channel fails.
	 * 
	 * @memberof ChatAppChanel
	 */
	async init() {
		try {
			this.userMsg = await APIgetMessages(this.contactId)
			this.innerChatChanel();
			this.handleCloseChatChanel();
			this.handlersRemoveBlockRelation();
			
			this.IChatAppMessage  = new IChatAppMessage(this.userMsg, this.userId, this.contactId, null);
			this.IChatAppGameInvite = new IChatAppGameInvite(this.userMsg, this.userId, this.contactId, null);
			
			let roomName = 'chat_';
			this.contactId > this.userId ? roomName += this.userId + '_' + this.contactId : roomName += this.contactId + '_' + this.userId;
			roomName = await APIgetHashRoom(roomName);
			this.wsChat = new IWs(roomName.roomName, 'chat', (message) => this.processWebSocketMessage(message));
			await this.wsChat.init();

			this.IChatAppMessage.wsChat = this.wsChat;
			this.IChatAppGameInvite.wsChat = this.wsChat;

		} catch (error) {
			console.error('Failed to toggleChanelChat', error);
		}
	}


	// ===============================================================================================
	// ======================================= Inner Element =========================================
	// ===============================================================================================


	/**
	 * Sets up the inner chat channel elements in the user interface.
	 * 
	 * This method populates the chat panel with the user's information, chat header, and 
	 * message input fields. It also adds event listeners for user interactions.
	 * 
	 * @async
	 * @function innerChatChanel
	 * 
	 * @throws {Error} Logs an error if setting up the inner chat channel fails.
	 * 
	 * @memberof ChatAppChanel
	 */
	async innerChatChanel() {
		try {
			var chatContainer = document.getElementById('chat-panel');
			if (!chatContainer) {
				console.error('Failed to innerChatChanel: chat-panel not found');
				return;
			}
			chatContainer.innerHTML = `
                <div id="chat-header">
                    <div class="chat-head-info">
                        <div class="user-head" id="pdp-chat-panel">
                            <a href="/profil?username=${this.contactUser.username}">
                                <img src="${this.contactUser.img.startsWith('profile_pics/') ? '/media/' + this.contactUser.img : this.contactUser.img}" alt="pp">
                            </a>
                            <span>${this.contactUser.username}</span>
                        </div>
                        <div class="btn-head" id="btn-head">
                            <button id="block-btn" class="btn btn-update" data-tooltip="Block this user" data-id="${this.contactId}" data-status="-2"><i class="fa-solid fa-user-slash"></i></button>
                            <button id="delete-btn" class="btn btn-update" data-tooltip="Delete your relation" data-id="${this.contactId}" data-status="-1"><i class="fa-solid fa-user-minus"></i></button>
                        </div>
                        <div class="btn-utils">
                            <button id="back-btn" class="btn btn-link"><i class="fa-solid fa-right-long"></i></button>
                        </div>
                    </div>
                </div>
                <div id="header-divider"></div>
                <div id="chat-box">
                    <div id="chat-messages"></div>
                    <div id="chat-input">
                        <input type="text" id="message-input" placeholder="Tapez votre message...">
                        <button class="action-btn" id="send-btn"><i class="fas fa-paper-plane"></i></button>
                        <button class="action-btn" id="invite-btn"><i class="fa-solid fa-gamepad"></i></button>
                    </div>
				</div>
			`;
		} catch (error) {
			console.error('Failed to innerChatChanel', error);
		}
	}


	// ===============================================================================================
	// ======================================= REMOVE Element ========================================
	// ===============================================================================================


	/**
	 * Removes the chat channel from the user interface.
	 * 
	 * This method hides the chat panel and displays the submenus again.
	 * 
	 * @async
	 * @function removeChatChanel
	 * 
	 * @throws {Error} Logs an error if removing the chat channel fails.
	 * 
	 * @memberof ChatAppChanel
	 */
	async removeChatChanel() {
		try {
			this.hidePanel();
			this.displaySubMenus();
		} catch (error) {
			console.error('Failed to removeChatChanel', error);
		}
	}


	// ===============================================================================================
	// ======================================= handle Element ========================================
	// ===============================================================================================


	/**
	 * Handles the action of going back to the chat menu.
	 * 
	 * This method closes the WebSocket connection, clears notifications for the chat, 
	 * removes the chat channel, and updates the notification status.
	 * 
	 * @async
	 * @function handlerBackToChatMenu
	 * 
	 * @throws {Error} Logs an error if handling back to chat menu fails.
	 * 
	 * @memberof ChatAppChanel
	 */
	async handlerBackToChatMenu() {
		try {
			await APIclearNotifChatFor(this.contactId);
			await this.notif.updateAllNotif();
			this.wsChat.closeWebSocket();
			this.removeChatChanel();
			this.notif.disableNotifSubMenus();
		} catch (error) {
			console.error('Failed to handlerBackToChatMenu', error);
		}
	}

	/**
	 * Sets up event listeners for closing the chat channel.
	 * 
	 * This method adds click event listeners to the back, block, and delete buttons to manage 
	 * user interactions with the chat channel.
	 * 
	 * @async
	 * @function handleCloseChatChanel
	 * 
	 * @throws {Error} Logs an error if handling close chat channel fails.
	 * 
	 * @memberof ChatAppChanel
	 */
	async handleCloseChatChanel() {
		try {
			const buttons = [
				document.getElementById('back-btn'),
				document.getElementById('block-btn'),
				document.getElementById('delete-btn')
			];
			buttons.forEach((btn, index) => {
				if (!btn) return;
				btn.addEventListener('click', async (event) => {
					event.preventDefault();
					this.handlerBackToChatMenu();
				});
			});
		} catch (error) {
			console.error('Failed to handleCloseChatChanel', error);
		}
	}

	/**
	 * Sets up event listeners for removing or blocking relations with the contact.
	 * 
	 * This method adds click event listeners to the buttons in the chat header for 
	 * updating the user's social status with the contact.
	 * 
	 * @async
	 * @function handlersRemoveBlockRelation
	 * 
	 * @throws {Error} Logs an error if handling block relation fails.
	 * 
	 * @memberof ChatAppChanel
	 */
	async handlersRemoveBlockRelation() {
		try {
			let head = document.getElementById('btn-head')
			for (const link of head.children) {
				link.addEventListener('click', async (event) => {
					event.preventDefault();
					var friendStatus = event.target.closest('button').getAttribute('data-status');
					await APIupdateSocialStatus(this.contactId, friendStatus);
				});
			}
		} catch (error) {
			console.error('Failed to handlersRemoveRelation', error);
		}
	}


	// ===============================================================================================
	// ========================================== Utils  =============================================
	// ===============================================================================================

	/**
	 * Processes incoming WebSocket messages.
	 * 
	 * This method handles incoming messages and distinguishes between regular chat messages 
	 * and game invites, directing them to the appropriate handler.
	 * 
	 * @param {Object} message - The incoming message object from the WebSocket.
	 * 
	 * @throws {Error} Logs an error if processing the WebSocket message fails.
	 * 
	 * @memberof ChatAppChanel
	 */
	processWebSocketMessage(message) {
		try {
			if (message['message'].startsWith('Game'))
				this.IChatAppGameInvite.handlersWsGameInvite(message['message'], message['senderId'])
			else
				this.IChatAppMessage.addMessageToChat(message['message'], message['senderId'], message['contactId'])
			} catch (error) {
			console.error('Failed to processWebSocketMessage', error);
		}
	}

}

export default ChatAppChanel;