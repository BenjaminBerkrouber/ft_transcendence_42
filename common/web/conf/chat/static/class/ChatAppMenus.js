
import IChatUi from './IChatUi.js';
import ChatAppChanel from './ChatAppChanel.js';

class ChatAppMenus extends IChatUi {
    constructor(userId, chatUsers) {
        super();

        this.userId = userId;
        this.chatUsers = chatUsers;
        this.init();
    }

    async init() {
        await this.innerChatMenus();
        this.displayChatMenus();

        this.handleCloseChatMenus();
        if (this.chatUsers.length > 0) {
            this.innerChatUsers(this.chatUsers);
            this.handlersContactClick();
        }
    }


    // ===============================================================================================
    // ======================================= Inner Element =========================================
    // ===============================================================================================


    async innerChatMenus() {
        try {
            let chatMenus = document.getElementById('pannel');
            chatMenus.innerHTML = `
                <div id="chat-container">
                    <div id="chat-panel">
                        <div id="chat-header">
                            <div class="chat-head-info">
                                <h3>Contacts</h3>
                                <button id="close-btn" class="btn btn-link"><i class="fa-solid fa-xmark"></i></button>
                                <button id="back-btn" class="btn btn-link" style="display: none;"><i
                                        class="fa-solid fa-right-long"></i></button>
                            </div>
                        </div>
                        <div id="header-divider" style="display: none;"></div>
                        <div id="contacts-list">
                        </div>
                        <div id="chat-box" style="display: none;">
                            <div id="chat-messages"></div>
                            <div id="chat-input">
                                <input type="text" id="message-input" placeholder="Tapez votre message...">
                                <button id="send-btn"><i class="fas fa-paper-plane"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Failed to innerChatMenus', error);
        }
    }

    async innerChatUsers(chatUsers) {
        try {
            let userChatContainer = document.getElementById('contacts-list');
            userChatContainer.innerHTML = chatUsers.map(user => `
                <div class="contact" data-contact-id="${user.id}">
                    <div class="contact-status ${user.is_online ? 'online' : 'offline'}">
                        <a href="/visited_profil/${user.username}/">
                            <img  src="${user.img.startsWith('profile_pics/') ? '/media/' + user.img : user.img}" class="contact-img" alt="${user.username}">
                            ${user.notif > 0 ? `<span class="mark-notif-chat">+${user.notif}</span>` : ''}
                        </a>
                        <span class="contact-name">${user.username}</span>
                    </div>
                    <div class="contact-online-status ${user.is_online ? 'online' : 'offline'}">
                    </div>
                </div>
            `).join('');
            const anchorTags = userChatContainer.querySelectorAll('a');
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
            console.error('Failed to innerChatUsers', error);
        }
    }


    // ===============================================================================================
    // ======================================= Display Element =======================================
    // ===============================================================================================


    async displayChatMenus() {
        try {
            const chatContainer = document.getElementById('chat-panel');
            chatContainer.classList.add('active');
        } catch (error) {
            console.error('Failed to displayChatMenus', error);
        }
    }


    // ===============================================================================================
    // ======================================= Hide Element =======================================
    // ===============================================================================================


    // ===============================================================================================
    // ======================================= handle Element =======================================
    // ===============================================================================================


    async handleCloseChatMenus() {
        try {
            const chatCloseBtn = document.getElementById('close-btn');
            chatCloseBtn.addEventListener('click', async () => {
                // await updateNotifChat();
                this.hidePanel();
                this.displaySubMenus();
                // disableNotifSubMenus();
            });
        } catch (error) {
            console.error('Failed to handleCloseChatMenus', error);
        }
    }

    async handlersContactClick() {
        try {
            document.querySelectorAll('.contact').forEach(contact => {
                contact.addEventListener('click', async (event) => {
                    let contactId = event.target.closest('.contact').getAttribute('data-contact-id');
                    // APIclearNotifChatFor(contactId);
                    const chatAppChanel = new ChatAppChanel(this.userId, contactId, await APIgetUserById(contactId) ,await APIgetMessages(contactId));
                });
            });
        } catch (error) {
            console.error('Failed to handlersContactClick', error);
        }
    }
}

export default ChatAppMenus;