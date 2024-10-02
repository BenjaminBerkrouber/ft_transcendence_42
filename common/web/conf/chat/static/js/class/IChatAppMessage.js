/**
 * IChatAppMessage class.
 * 
 * This class manages the chat message functionalities within the chat application.
 * It handles message rendering, sending messages through WebSocket, and displaying 
 * error messages. The class provides a structured way to manage chat interactions 
 * between users.
 * 
 * @class IChatAppMessage
 * 
 * @property {Array} messages - The list of chat messages associated with the conversation.
 * @property {number} userId - The ID of the current user interacting with the chat.
 * @property {number} contactId - The ID of the contact involved in the chat.
 * @property {Object} wsChat - The WebSocket connection instance for real-time chat functionality.
 * 
 * @memberof IChatAppMessage
 */
class IChatAppMessage {


	// ===============================================================================================
	// =========================================== Constructor =======================================
	// ===============================================================================================


	/**
	 * IChatAppMessage class constructor.
	 * 
	 * Initializes the IChatAppMessage instance with messages, user ID, contact ID, 
	 * and WebSocket connection. This constructor sets up the initial state for the 
	 * chat messages and calls the initialization method to prepare the chat interface 
	 * for user interactions.
	 * 
	 * @constructor
	 * @param {Array} messages - The list of chat messages associated with the conversation.
	 * @param {number} userId - The ID of the current user interacting with the chat.
	 * @param {number} contactId - The ID of the contact involved in the chat.
	 * @param {Object} wsChat - The WebSocket connection instance for real-time chat functionality.
	 * 
	 * @property {Array} messages - The list of chat messages associated with the conversation.
	 * @property {number} userId - The ID of the current user interacting with the chat.
	 * @property {number} contactId - The ID of the contact involved in the chat.
	 * @property {Object} wsChat - The WebSocket connection instance for real-time chat functionality.
	 * 
	 * @memberof IChatAppMessage
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
	 * Initializes the chat messages and sets up event handlers.
	 * 
	 * This method calls innerMessages to display the messages and initializes 
	 * event handlers for sending messages. If an error occurs during initialization, 
	 * it logs the error in the console.
	 * 
	 * @async
	 * @function init
	 * 
	 * @throws {Error} Logs an error if initializing chat messages or handlers fails.
	 * 
	 * @memberof IChatAppMessage
	 */
	async init() {
		try {
			this.innerMessages();
			this.handlersSendMessage();
		} catch (error) {
			console.error('Failed to init', error);
		}
	}


	// ===============================================================================================
	// ======================================= Inner Element =========================================
	// ===============================================================================================


	/**
	 * Renders the chat messages in the chat interface.
	 * 
	 * This method creates message elements from the provided messages and appends 
	 * them to the chat message container. It also ensures the chat is scrolled to the bottom.
	 * 
	 * @async
	 * @function innerMessages
	 * 
	 * @throws {Error} Logs an error if rendering messages fails.
	 * 
	 * @memberof IChatAppMessage
	 */
	async innerMessages() {
		try {
			let chatMessages = document.getElementById('chat-messages');
			if (!chatMessages) return;
			chatMessages.innerHTML = '';

			let fragment = document.createDocumentFragment();

			this.messages.forEach(message => {
				const msgDiv = this.createMessageElement(message);
				fragment.appendChild(msgDiv);
			});
			chatMessages.appendChild(fragment);
			chatMessages.scrollTop = chatMessages.scrollHeight;
		} catch (error) {
			console.error('Failed to innerMessages', error);
		}
	}


	// ===============================================================================================
	// ======================================= handle Element =======================================
	// ===============================================================================================


	/**
	 * Initializes event handlers for sending messages.
	 * 
	 * This method sets up click and keydown event listeners for the send button 
	 * and message input field. If an error occurs while setting up handlers, 
	 * it logs the error in the console.
	 * 
	 * @async
	 * @function handlersSendMessage
	 * 
	 * @throws {Error} Logs an error if initializing send message handlers fails.
	 * 
	 * @memberof IChatAppMessage
	 */
	async handlersSendMessage() {
		try {
			let sendBtn = document.getElementById('send-btn');
			let messageInput = document.getElementById('message-input');
			if (!sendBtn || !messageInput) return;
			this.attachSendEvent(sendBtn, 'click');
			this.attachSendEvent(messageInput, 'keydown', 'Enter');
		} catch (error) {
			console.error('Failed to initialize handlersSendMessage', error);
		}
	}

	/**
	 * Handles error messages by displaying them in the chat.
	 * 
	 * This method creates an error message element and appends it to the chat 
	 * message container, ensuring the chat is scrolled to the bottom.
	 * 
	 * @async
	 * @function handlerErrorMessages
	 * @param {string} message - The error message to be displayed.
	 * 
	 * @throws {Error} Logs an error if handling error messages fails.
	 * 
	 * @memberof IChatAppMessage
	 */
	async handlerErrorMessages(message) {
		try {
			let messageInput = document.getElementById('message-input');
			let chatMessages = document.getElementById('chat-messages');

			if (!messageInput || !chatMessages) return;
			messageInput.value = '';

			let parentDiv = this.createErrorMessageContainer();
			let msgDiv = this.createErrorMessage(message);
			parentDiv.appendChild(msgDiv);
			chatMessages.appendChild(parentDiv);
			chatMessages.scrollTop = chatMessages.scrollHeight;
		} catch (error) {
			console.error('Failed to handle error message', error);
		}
	}


	// ===============================================================================================
	// ===================================== Utils Inner Message =====================================
	// ===============================================================================================


	/**
	 * Creates a message element from the provided message object.
	 * 
	 * This method creates a div for the message and applies appropriate styles based 
	 * on the message type (text message or game invite).
	 * 
	 * @function createMessageElement
	 * @param {Object} message - The message object to be rendered.
	 * @returns {HTMLElement} The created message element.
	 * 
	 * @memberof IChatAppMessage
	 */
	createMessageElement(message) {
		const msgDiv = document.createElement('div');
		msgDiv.classList.add('message');
		message.type == 0 ? this.applyTextMessageStyle(msgDiv, message) : this.applyGameInviteStyle(msgDiv, message);
		return msgDiv;
	}

	/**
	 * Applies styles for a text message.
	 * 
	 * This method sets the class for the message div based on the sender ID and 
	 * sets the text content of the message.
	 * 
	 * @function applyTextMessageStyle
	 * @param {HTMLElement} msgDiv - The message div element.
	 * @param {Object} message - The message object.
	 * 
	 * @memberof IChatAppMessage
	 */
	applyTextMessageStyle(msgDiv, message) {
		message.sender == this.contactId ? msgDiv.classList.add('their-message') : msgDiv.classList.add('my-message');
		msgDiv.textContent = message.content;
	}

	/**
	 * Applies styles for a game invite message.
	 * 
	 * This method sets the class for the message div based on the status of the game 
	 * invite and appends additional elements to represent the game invite.
	 * 
	 * @function applyGameInviteStyle
	 * @param {HTMLElement} msgDiv - The message div element.
	 * @param {Object} message - The message object.
	 * 
	 * @memberof IChatAppMessage
	 */
	applyGameInviteStyle(msgDiv, message) {
		message.status == 1 ? msgDiv.classList.add('their-message') : msgDiv.classList.add('my-message');

		msgDiv.classList.add('game-invite');
		msgDiv.id = 'game-invite';
		const gameDiv = document.createElement('div');
		gameDiv.classList.add('game-invite-head');
		gameDiv.innerHTML = '<img src="https://d1tq3fcx54x7ou.cloudfront.net/uploads/store/tenant_161/download/366/image/large-041f064dd94c96b097973e5d41a9c45f.jpg" alt="game-inv-img">';
		msgDiv.appendChild(gameDiv);
		this.getInvitationStatus(msgDiv, message);
	}

	/**
	 * Retrieves the invitation status for a game invite message.
	 * 
	 * This method creates a div with options for accepting, declining, or 
	 * joining a game based on the message status.
	 * 
	 * @async
	 * @function getInvitationStatus
	 * @param {HTMLElement} msgDiv - The message div element to append the status to.
	 * @param {Object} message - The message object containing the invitation status.
	 * 
	 * @memberof IChatAppMessage
	 */
	async getInvitationStatus(msgDiv, message) {
		let chooseGamesDiv = document.createElement('div');
		chooseGamesDiv.className = 'choose-games';
		const statusActions = {
			0: '<span>Pending</span>',
			1: '<button class="btn btn-update" data-tooltip="Accept game"><i id="accept-btn" class="fa-solid fa-check"></i></button><button class="btn btn-update" data-tooltip="Refuse game"><i id="decline-btn" class="fa-solid fa-xmark"></i></button>',
			'-2': '<span>Declined</span>',
			2: '<button id="join-btn" class="btn btn-join" data-tooltip="Join lobby">Join</button>'
		};
		chooseGamesDiv.innerHTML = statusActions[message.status] || '<span>Unknown</span>';
		msgDiv.appendChild(chooseGamesDiv);
	}


	// ===============================================================================================
	// ======================================= Utils Error  ==========================================
	// ===============================================================================================


	/**
	 * Creates a container for error messages.
	 * 
	 * This method generates a parent div for displaying error messages with an 
	 * error icon.
	 * 
	 * @function createErrorMessageContainer
	 * @returns {HTMLElement} The created error message container.
	 * 
	 * @memberof IChatAppMessage
	 */
	createErrorMessageContainer() {
		let parentDiv = document.createElement('div');
		parentDiv.classList.add('error-parent');
		parentDiv.innerHTML = '<i class="fa-solid fa-circle-exclamation error-icon"></i>';
		return parentDiv;
	}

	/**
	 * Creates an error message element.
	 * 
	 * This method generates a div for the error message with the specified text.
	 * 
	 * @function createErrorMessage
	 * @param {string} message - The error message text.
	 * @returns {HTMLElement} The created error message element.
	 * 
	 * @memberof IChatAppMessage
	 */
	createErrorMessage(message) {
		let msgDiv = document.createElement('div');
		msgDiv.className = 'message error-message';
		msgDiv.innerText = message;
		return msgDiv;
	}


	// ===============================================================================================
	// ==================================== Utils SendMessage  =======================================
	// ===============================================================================================


	/**
	 * Attaches event listeners for sending messages.
	 * 
	 * This method sets up an event listener for the specified event type on the 
	 * given element. It triggers message sending on click or Enter key press.
	 * 
	 * @function attachSendEvent
	 * @param {HTMLElement} element - The HTML element to attach the event listener to.
	 * @param {string} eventType - The type of the event (click or keydown).
	 * @param {string} [key=null] - Optional specific key to trigger the event (default is null).
	 * 
	 * @memberof IChatAppMessage
	 */
	attachSendEvent(element, eventType, key = null) {
		element.addEventListener(eventType, async (event) => {
			if (!key || (eventType === 'keydown' && event.key === key)) {
				this.progressSendMessages(this.contactId, this.wsChat);
			}
		});
	}

	/**
	 * Processes the sending of messages through WebSocket and API.
	 * 
	 * This method retrieves the message from the input, sends it to the API, 
	 * and if successful, it sends the message through WebSocket.
	 * 
	 * @async
	 * @function progressSendMessages
	 * 
	 * @throws {Error} Logs an error if processing sending messages fails.
	 * 
	 * @memberof IChatAppMessage
	 */
	async progressSendMessages() {
		try {
			let messageInput = document.getElementById('message-input');
			let message = messageInput.value.trim();
			if (!message) return;
			messageInput.value = '';

			let resp = await APIsendMessage(this.contactId, message);

			if (resp.status === 201)
				return this.handlerErrorMessages(message);

			let data = {
				'message': message,
				'senderId': this.userId,
				'contactId': this.contactId
			};

			this.wsChat.sendToWebSocket(data)
		} catch (error) {
			console.error('Failed to progressSendMessages', error);
		}
	}


	// ===============================================================================================
	// ================================= Utils addReceiveMessge  =====================================
	// ===============================================================================================


	/**
	 * Adds a new message to the chat interface.
	 * 
	 * This method creates a message element and appends it to the chat based on 
	 * the sender ID.
	 * 
	 * @async
	 * @function addMessageToChat
	 * @param {string} message - The message content.
	 * @param {number} senderId - The ID of the sender.
	 * @param {number} contactId - The ID of the contact.
	 * 
	 * @throws {Error} Logs an error if adding the message to the chat fails.
	 * 
	 * @memberof IChatAppMessage
	 */
	async addMessageToChat(message, senderId, contactId) {
		try {
			if (!message || !senderId || !contactId) return;

			let sender = senderId === this.userId ? 'my-message' : 'their-message';
			this.appendMessageToChat(message, sender);
		} catch (error) {
			console.error('Error in addMessageToChat:', error);
		}
	}

	/**
	 * Appends a message to the chat display.
	 * 
	 * This method creates a div for the message with the appropriate class and 
	 * appends it to the chat message container.
	 * 
	 * @async
	 * @function appendMessageToChat
	 * @param {string} message - The message content to append.
	 * @param {string} messageClass - The CSS class for the message.
	 * 
	 * @memberof IChatAppMessage
	 */
	async appendMessageToChat(message, messageClass) {
		let chatMessages = document.getElementById('chat-messages');
		let msgDiv = document.createElement('div');
		msgDiv.className = `message ${messageClass}`;
		msgDiv.textContent = message;

		chatMessages.appendChild(msgDiv);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}

}

export default IChatAppMessage;