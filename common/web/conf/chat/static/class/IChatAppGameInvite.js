class IChatAppGameInvite {
	constructor(messages, userId, contactId) {
		this.messages = messages;
		this.userId = userId;
		this.contactId = contactId;
		this.wsChat = null;
		this.init();
	}

	async init() {
		try {
			this.handlersGameInvite();
			this.handlersInviteResp();
		} catch (error) {
			console.error('Failed to init IChatAppGameInvite:', error);
		}
	}

	async updateInviteStatusUI() {
		try {
			let chatMessages = document.getElementById('chat-messages');
			let gameInvites = chatMessages.getElementsByClassName('game-invite');
			for (let i = 0; i < gameInvites.length; i++) {
				let gameInvite = gameInvites[i];
				let chooseGamesDiv = gameInvite.getElementsByClassName('choose-games')[0];
				this.status == 2 ? chooseGamesDiv.innerHTML = '<button class="btn btn-join" data-tooltip="Join lobby">Join</button>' : chooseGamesDiv.innerHTML = '<span>Declined</span>';
			}
		} catch (error) {
			console.error('Failed to updateInviteStatusUI:', error);
		}
	}

	async handlersInviteResp() {
		try {
			let chatMessages = document.getElementById('chat-messages');
			chatMessages.addEventListener('click', async (event) => {
				if (event.target.classList.contains('btn-update')) {

					let status = event.target.getAttribute('data-tooltip');
					status = status === 'Accept game' ? 2 : -1;
					let resp = await fetch(`/api/updateInviteStatus/`, {
						method: 'POST',
						headers: {
							'X-CSRFToken': getCookie('csrftoken'),
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							contactId: this.contactId,
							status: status,
						}),
					});
					resp = await resp.json();
					this.updateInviteStatusUI();
					let msg = status === 2 ? 'Game accepted' : 'Game declined';
					sendWebSocketMessage(msg, this.userId, this.contactId, this.wsChat);
				} else if (event.target.classList.contains('btn-join')) {


					htmx.ajax('GET', '/game/pong/privGame/?opponent=' + this.contactId, {
						target: '#main-content', // The target element to update
						swap: 'innerHTML', // How to swap the content
					}).then(response => {
						history.pushState({}, '', '/game/pong/privGame/?opponent=' + this.contactId);
					});

				}
			});
		} catch (error) {
			console.error('Failed to update invite status:', error);
		}
	}


	async handlersGameInvite() {
		try {
			let inviteBtn = document.getElementById('invite-btn');

			inviteBtn.addEventListener('click', async () => {
				let resp = await fetch(`/api/sendInvite/`, {
					method: 'POST',
					headers: {
						'X-CSRFToken': getCookie('csrftoken'),
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						contactId: this.contactId,
					}),
				});
				if (resp.status === 201) {
					this.errorInviteHandler();
					return;
				}
				resp = await resp.json();
				let message = 'Game invite';
				sendWebSocketMessage(message, this.userId, this.contactId, this.wsChat);
				this.removeGameInvites();
				let chatMessages = document.getElementById('chat-messages');
				var msgDiv = document.createElement('div');
				msgDiv.className = 'message';
				msgDiv.classList.add('my-message');
				msgDiv.classList.add('game-invite');
				let gameDiv = document.createElement('div');
				gameDiv.className = 'game-invite-head';
				gameDiv.innerHTML = '<img src="https://d1tq3fcx54x7ou.cloudfront.net/uploads/store/tenant_161/download/366/image/large-041f064dd94c96b097973e5d41a9c45f.jpg" alt="game-inv-img">';
				msgDiv.appendChild(gameDiv);
				let chooseGamesDiv = document.createElement('div');
				chooseGamesDiv.className = 'choose-games';
				chooseGamesDiv.innerHTML += '<span>Pending</span>';
				msgDiv.appendChild(chooseGamesDiv);
				chatMessages.appendChild(msgDiv);
				chatMessages.scrollTop = chatMessages.scrollHeight;
			});
		} catch (error) {
			console.error('Failed to handlersGameInvite:', error);
		}
	}

	async errorInviteHandler() {
		this.removeGameInvites();
		let chatMessages = document.getElementById('chat-messages');
		var parentDiv = document.createElement('div');
		parentDiv.classList.add('error-parent-invite');
		parentDiv.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="color: #ff0000;"></i>';
		var msgDiv = document.createElement('div');
		msgDiv.className = 'message';
		msgDiv.classList.add('error-message');
		msgDiv.classList.add('game-invite');
		let gameDiv = document.createElement('div');
		gameDiv.className = 'game-invite-head';
		gameDiv.innerHTML = '<img src="https://d1tq3fcx54x7ou.cloudfront.net/uploads/store/tenant_161/download/366/image/large-041f064dd94c96b097973e5d41a9c45f.jpg" alt="game-inv-img">';
		msgDiv.appendChild(gameDiv);
		let chooseGamesDiv = document.createElement('div');
		chooseGamesDiv.className = 'choose-games';
		chooseGamesDiv.innerHTML += '<span>Error</span>';
		msgDiv.appendChild(chooseGamesDiv);
		parentDiv.appendChild(msgDiv);
		chatMessages.appendChild(parentDiv);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}

	async removeGameInvites() {
		let chatMessages = document.getElementById('chat-messages');
		let gameInvites = chatMessages.getElementsByClassName('game-invite');
		while (gameInvites[0]) {
			gameInvites[0].parentNode.removeChild(gameInvites[0]);
		}
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

export default IChatAppGameInvite;