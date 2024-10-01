import IChatAppMessage from './IChatAppMessage.js';
import IChatUi from './IChatUi.js';
import IChatAppGameInvite from './IChatAppGameInvite.js';

class ChatAppChanel extends IChatUi {
	constructor(userId, contactId, contactUser, userMsg) {
		super();
		this.userId = userId;

		this.contactId = contactId;
		this.contactUser = contactUser;

		this.userMsg = userMsg;
		this.wsChat = null;
		this.init();
	}


	async init() {
		try {
			let roomName = 'chat_';
			this.contactId > this.userId ? roomName += this.userId + '_' + this.contactId : roomName += this.contactId + '_' + this.userId;
			roomName = await APIgetHashRoom(roomName);
			this.wsChat = await connectWebSocket(roomName.roomName);

			console.log('contacvtuser', this.contactUser);
			this.innerChatChanel();
			this.handleCloseChatChanel();
			this.handlersRemoveBlockRelation();

			let iChatAppMessage = new IChatAppMessage(this.userMsg, this.userId, this.contactId, this.wsChat);
			let iChatAppGameInvite = new IChatAppGameInvite(this.userMsg, this.userId, this.contactId, this.wsChat);
		} catch (error) {
			console.error('Failed to toggleChanelChat', error);
		}
	}


	// ===============================================================================================
	// ======================================= Inner Element =========================================
	// ===============================================================================================


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
                            <a href="/visited_profil/${this.contactUser.username}/">
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

			const anchorTags = chatContainer.querySelectorAll('a');
			anchorTags.forEach(anchor => {
				anchor.addEventListener('click', async (event) => {
					event.preventDefault();
					let href = event.currentTarget.href;
					htmx.ajax('GET', href, {
						target: '#main-content', // The target element to update
						swap: 'innerHTML', // How to swap the content
					}).then(response => {
						history.pushState({}, '', href);
					});
				});
			});
		} catch (error) {
			console.error('Failed to innerChatChanel', error);
		}
	}

	// ===============================================================================================
	// ======================================= REMOVE Element =======================================
	// ===============================================================================================

	async removeChatChanel() {
		try {
			let chatContainer = document.getElementById('chat-panel');
			chatContainer.innerHTML = '';
		} catch (error) {
			console.error('Failed to removeChatChanel', error);
		}
	}


	// ===============================================================================================
	// ======================================= handle Element =======================================
	// ===============================================================================================

	async handlerBackToChatMenu() {
		try {
			this.removeChatChanel();
			this.wsChat.close();
			
		} catch (error) {
			console.error('Failed to handlerBackToChatMenu', error);
		}
	}

	async handleCloseChatChanel() {
		try {
			const backBtn = document.getElementById('back-btn');
			const blockBtn = document.getElementById('block-btn');
			const deleteBtn = document.getElementById('delete-btn');
			backBtn.addEventListener('click', async function () {
				// await APIclearNotifChatFor(this.contactId);
				this.handlerBackToChatMenu();
			});
			blockBtn.addEventListener('click', async function () {
				// await APIclearNotifChatFor(this.contactId);
				this.handlerBackToChatMenu();
			});
			deleteBtn.addEventListener('click', async function () {
				// await APIclearNotifChatFor(this.contactId);
				this.handlerBackToChatMenu();
			});
		} catch (error) {
			console.error('Failed to handleCloseChatChanel', error);
		}
	}

	async handlersRemoveBlockRelation() {
		try {
			let head = document.getElementById('btn-head')
			for (const link of head.children) {
				link.addEventListener('click', async (event) => {
					event.preventDefault();
					var socialUserId = event.target.closest('button').getAttribute('data-id');
					var friendStatus = event.target.closest('button').getAttribute('data-status');
					await APIupdateSocialStatus(socialUserId, friendStatus);
					toggleChatMenu();
				});
			}
		} catch (error) {
			console.error('Failed to handlersRemoveRelation', error);
		}
	}


}

export default ChatAppChanel;