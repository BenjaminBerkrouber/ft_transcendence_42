class IChatAppMessage {
	constructor(messages, userId, contactId) {
		this.messages = messages;
		this.userId = userId;
		this.contactId = contactId;

		this.init();
	}

	async init() {
		try {
			this.innerMessages();
			this.handlersSendMessage();
		} catch (error) {
			console.error('Failed to init', error);
		}
	
	}

	async innerMessages() {
		try {
			let chatMessages = document.getElementById('chat-messages');
			chatMessages.innerHTML = '';
			this.messages.forEach(message => {
				var msgDiv = document.createElement('div');
				msgDiv.className = 'message';

				if (message.type == 0) {
					message.sender == this.contactId ? msgDiv.classList.add('their-message') : msgDiv.classList.add('my-message');
					msgDiv.textContent = message.content;
				}
				else {
					message.status == 1 ? msgDiv.classList.add('their-message') : msgDiv.classList.add('my-message');
					msgDiv.classList.add('game-invite');
					let gameDiv = document.createElement('div');
					gameDiv.className = 'game-invite-head';
					gameDiv.innerHTML = '<img src="https://d1tq3fcx54x7ou.cloudfront.net/uploads/store/tenant_161/download/366/image/large-041f064dd94c96b097973e5d41a9c45f.jpg" alt="game-inv-img">';
					msgDiv.appendChild(gameDiv);
					this.getInvitationStatus(msgDiv, message);
				}
				chatMessages.appendChild(msgDiv);
			});
			chatMessages.scrollTop = chatMessages.scrollHeight;
		} catch (error) {
			console.error('Failed to innerMessages', error);
		}
	}

	async handlersSendMessage() {
		let sendBtn = document.getElementById('send-btn');
		sendBtn.addEventListener('click', async () => {
			this.progressSendMessages(this.contactId, this.wsChat);
		});
		let messageInput = document.getElementById('message-input');
		messageInput.addEventListener('keydown', async (event) => {
			if (event.key === 'Enter') {
				this.progressSendMessages(this.contactId, this.wsChat);
			}
		});
	}

	async progressSendMessages() {
		try {
			let messageInput = document.getElementById('message-input');
			messageInput.innerHTML = '';
			let message = messageInput.value;
			if (message) {
				let resp = await fetch(`/api/sendMessage/`, {
					method: 'POST',
					headers: {
						'X-CSRFToken': getCookie('csrftoken'),
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						contactId: this.contactId,
						message: message,
					}),
				});
				if (resp.status === 201) {
					handlerErrorMessages(messageInput, message);
					return;
				}
				resp = await resp.json();
				sendWebSocketMessage(message, this.userId, this.contactId, this.wsChat);
				messageInput.value = '';
				let chatMessages = document.getElementById('chat-messages');
				var msgDiv = document.createElement('div');
				msgDiv.className = 'message';
				if (resp.sender === this.contactId) {
					msgDiv.classList.add('their-message');
				} else {
					msgDiv.classList.add('my-message');
				}
				msgDiv.textContent = message;
				chatMessages.appendChild(msgDiv);
				chatMessages.scrollTop = chatMessages.scrollHeight;
			}
		} catch (error) {
			console.error('Failed to progressSendMessages', error);
		}
	}

	async handlerErrorMessages(messageInput, message) {
		messageInput.value = '';
		let chatMessages = document.getElementById('chat-messages');
		var parentDiv = document.createElement('div');
		var msgDiv = document.createElement('div');

		msgDiv.className = 'message';

		parentDiv.classList.add('error-parent');
		parentDiv.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="color: #ff0000;"></i>';

		msgDiv.innerText = message;
		msgDiv.classList.add('error-message');

		parentDiv.appendChild(msgDiv);
		chatMessages.appendChild(parentDiv);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}
	
	async getInvitationStatus(msgDiv, message) {
		let chooseGamesDiv = document.createElement('div');
		chooseGamesDiv.className = 'choose-games';
		const statusActions = {
			0: '<span>Pending</span>',
			1: '<button class="btn btn-update" data-tooltip="Accept game"><i class="fa-solid fa-check"></i></button>'
				+ '<button class="btn btn-update" data-tooltip="Refuse game"><i class="fa-solid fa-xmark"></i></button>',
			'-1': '<span>Declined</span>',
			2: '<button class="btn btn-join" data-tooltip="Join lobby">Join</button>'
		};
		chooseGamesDiv.innerHTML = statusActions[message.status] || '<span>Unknown</span>';
		msgDiv.appendChild(chooseGamesDiv);
	}
}

export default IChatAppMessage;