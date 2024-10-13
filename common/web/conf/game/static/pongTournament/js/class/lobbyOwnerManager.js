import IWs from '../../../class/IWs.js';

class lobbyOwnerManager {


    // ===============================================================================================
	// =========================================== Constructor =======================================
	// ===============================================================================================


    constructor(uiLobby) {
        this.availableUsers = [];
        this.uiLobby = uiLobby;
        this.init();
    }


    // ===============================================================================================
	// ============================================= INIT ============================================
	// ===============================================================================================


    async init() {
        try {
            this.availableUsers = await APIgetAvailableUserToLobby(this.uiLobby.lobbyUUID);
            this.innerContent();
            if (this.uiLobby.isLocked)
                this.updateLockAtRedirect();
            this.handlersLockLobby();
        } catch (error) {
            console.error('Failed to init', error);
        }
    }


    // ===============================================================================================
	// ======================================= Inner Element =========================================
	// ===============================================================================================


    innerContent() {
        try {
            this.innerAddingPlayerForm();
            this.innerLockButton();
        } catch (error) {
            console.error('Failed to innerContent', error);
        }
    }

    innerAddingPlayerForm() {
        try {
            let parrentBox = document.getElementById('slop-content');
            if (!parrentBox) return;
            let newPlayerSlot = document.createElement('div');
            newPlayerSlot.id = "new-player-slot";
            newPlayerSlot.classList.add('player-slot');
            newPlayerSlot.innerHTML = `
                <div id="newplayer-btn" class="newplayer-slot active">
                    <i class="fa-solid fa-plus"></i>
                    <span>Adding new participate</span>
                </div>
                <div id="menus-new-player">
                    <div id="new-player-chose" class="new-option">
                        <i class="fas fa-user-plus"></i><span>Add player</span>
                    </div>
                    <div id="new-ia-chose" class="new-option">
                        <i class="fas fa-robot"></i><span>Add IA</span>
                    </div>
                </div>
            `;
            parrentBox.insertBefore(newPlayerSlot, parrentBox.firstChild);
        } catch (error) {
            console.error('Failed to innerAddingPlayerForm', error);
        }
        this.handlerAddPlayer();
    }

    innerLockButton() {
        try {
            let parrentBox = document.getElementById('lobby-footer');
            if (!parrentBox) return;
            let lockButton = document.createElement('button');
            lockButton.id = "lock-lobby";
            lockButton.classList.add('lock-lobby');
            lockButton.innerHTML = 'Lock';
            parrentBox.insertBefore(lockButton, parrentBox.firstChild);
        } catch (error) {
            console.error('Failed to innerLockButton', error);
        }
    }


	// ===============================================================================================
	// ======================================= handle Element ========================================
	// ===============================================================================================


    handlerAddPlayer() {
        try {
            let newPlayerSlot = document.getElementById('newplayer-btn');
            newPlayerSlot.addEventListener('click', () => {
                this.displayChosePlayerType();
                this.handlersChosePlayerType();
            });
        } catch (error) {
            console.error('Failed to handlerAddPlayer', error);
        }
    }

    handlersChosePlayerType() {
        try {
            let newPlayerSlot = document.getElementById('new-player-chose');
            let newIASlot = document.getElementById('new-ia-chose');
            newPlayerSlot.addEventListener('click', async () => {
                this.displaySelectPlayerForm();
                this.displayNewPlayerForm();
            });

            newIASlot.addEventListener('click', async () => {
                await APIaddIaToLobby(this.uiLobby.lobbyUUID);
                this.uiLobby.wsLobby.sendToWebSocket({
                    "userId": this.uiLobby.playerData.getId(),
                    "eventType": "addIa",
                    "message": `addIa | 0`
                });
                this.displayNewPlayerForm();
            });
        } catch (error) {
            console.error('Failed to handlersChosePlayer', error);
        }
    }
    
    handlersSearchPlayer() {
        try {
            let searchPlayer = document.querySelector('.search-player input');
            searchPlayer.addEventListener('input', async () => {
                let search = searchPlayer.value;
                let findUsername = search.toLowerCase();
                let boxFindPlayer = document.getElementById('player-found');
                boxFindPlayer.innerHTML = '';
                if (findUsername) {
                    const usersArray = Object.values(this.availableUsers);
                    const filteredUsers = usersArray.filter(user => user.username.toLowerCase().includes(findUsername));
                    filteredUsers.forEach(user => {
                        this.displayAllPlayerFound(user);
                    });
                }
            });
        } catch (error) {
            console.error('Failed to handlersSearchPlayer', error);
        }
    }

    async handlersLockLobby() {
        try {
            let lockLobby = document.getElementById('lock-lobby');
            if (!lockLobby) return;
            lockLobby.addEventListener('click', async () => {
                // if (this.uiLobby.getNbrPlayer() < 4 || (this.uiLobby.getNbrPlayer() & (this.uiLobby.getNbrPlayer() - 1)) !== 0)
                //     return console.log('You need to add more players ');
                // if (!this.uiLobby.isAllPlayerLogged()) {
                //     for (let userId of this.uiLobby.getIdsOfHumanPlayersNotLogged())
                //         this.sendWsNotifAtUser(userId);
                //     return console.log('You need to wait for all player to be ready');
                // }
                await APIlockLobby(lobbyUUID);
                this.uiLobby.wsLobby.sendToWebSocket({
                    "userId": this.uiLobby.playerData.getId(),
                    "eventType": "lock",
                    "message": `lock | ${this.uiLobby.lobbyUUID}`
                });
                this.updateLockAtRedirect();
            });
        } catch (error) {
            console.error('Failed to handlersLockLobby', error);
        }
    }

    async handlerRedirectPlayerBtn() {
        try {
            let redirect = document.getElementById('redirect-btn');
            if (!redirect) return;
            redirect.addEventListener('click', async () => {
                if (!this.uiLobby.isAllPlayerLogged()) {
                    for (let userId of this.uiLobby.getIdsOfHumanPlayersNotLogged())
                        this.sendWsNotifAtUser(userId);
                    return console.log('You need to wait for all player to be ready');
                }
                this.uiLobby.wsLobby.sendToWebSocket({
                    "userId": this.uiLobby.playerData.getId(),
                    "eventType": "redirect",
                    "message": `redirect | /game/pong/tournament/game/?lobby_id=${this.uiLobby.lobbyUUID}`
                });
                // await APIfinishGameOnlyIa(lobbyUUID);
            });
        } catch (error) {
            console.error('Failed to handlerRedirect', error);
        }
    }


    // ===============================================================================================
	// ======================================= Display Element =======================================
	// ===============================================================================================


    async displayChosePlayerType() {
        try {
            let newPlayerBtn = document.getElementById('newplayer-btn');
            if (newPlayerBtn)
                newPlayerBtn.classList.remove('active');
            let chosePlayerBtn = document.getElementById('menus-new-player');
            if (chosePlayerBtn)
                chosePlayerBtn.classList.add('active');
        } catch (error) {
            console.error('Failed to toggleChosePlayer', error);
        }
    }

    async displayNewPlayerForm() {
        try {
            let chosePlayerBtn = document.getElementById('menus-new-player');
            if (chosePlayerBtn)
                chosePlayerBtn.classList.remove('active');
            let newPlayerBtn = document.getElementById('newplayer-btn');
            if (newPlayerBtn)
                newPlayerBtn.classList.add('active');
        } catch (error) {
            console.error('Failed to displayNewPlayerForm', error);
        }
    }

    async displaySelectPlayerForm() {
        try {
            let newPlayerSlot = document.getElementById('new-player-slot');
            let newPlayerDiv = document.createElement('div');
            newPlayerDiv.className = 'player-slot';
            newPlayerDiv.innerHTML = `
                <div class="search-player" id="search-player">
                    <div class="tmp-pp">
                        <i class="fas fa-question-circle"></i>
                    </div>
                    <div class="find-player">
                        <input type="text" placeholder="Enter player name">
                    </div>
                </div>
                <div class="player-found" id="player-found">
                </div>
            `;
            newPlayerSlot.parentNode.insertBefore(newPlayerDiv, newPlayerSlot);
            this.handlersSearchPlayer();
        } catch (error) {
            console.error('Failed to innerNewPlayer', error);
        }
    }


    async displayAllPlayerFound(user) {
        try {
            let boxFindPlayer = document.getElementById('player-found');
            let boxPlayer = document.createElement('div');
            boxPlayer.className = 'player';
            boxPlayer.innerHTML = `
                <div class="img-player" id="user_${user.id}"><img src="${user.img.startsWith("profile_pics/") ? "/media/" + user.img : user.img}" alt="pp"></div>
                <div class="username-player"><span>${user.username}</span></div>
            `;
            boxFindPlayer.appendChild(boxPlayer);
            boxPlayer.addEventListener('click', async () => {
                await APIaddPlayerToLobby(this.uiLobby.lobbyUUID, user.id);
                this.hideSelectPlayerForm();
                this.uiLobby.wsLobby.sendToWebSocket({
                    "userId": this.uiLobby.playerData.getId(),
                    "eventType": "addPlayer",
                    "message": `addPlayer | ${user.id}`
                });
            });
        } catch (error) {
            console.error('Failed to innerPlayerFound', error);
        }
    }


    // ===============================================================================================
	// ======================================== Hide Element =========================================
	// ===============================================================================================


    async hideSelectPlayerForm() {
        try {
            let box = document.getElementById('search-player');
            let parrentBox = box.parentNode;
            parrentBox.removeChild(box);
            parrentBox.remove();
        } catch (error) {
            console.error('Failed to hideSelectPlayerForm', error);
        }
    }


    // ===============================================================================================
	// ======================================== Utils Element ========================================
	// ===============================================================================================




    async sendWsNotifAtUser(userId) {
        try {
            let roomName = await APIgetHashRoom('notif_' + userId);
            let wsNotif = new IWs(roomName.roomName, 'notif', () => {});
            await wsNotif.init();
            await wsNotif.sendToWebSocket({
                'notifType': 'userNotReady',
                'ID_Game': 'null',
                'userDestination': userId,
                'UUID_Tournament': this.uiLobby.lobbyUUID,
                'link': '/game/pong/tournament/lobby/?lobby_id='+this.uiLobby.lobbyUUID,
            });
            setTimeout(() => { wsNotif.closeWebSocket();}, 1000);
        } catch (error) {
            console.error('Failed to sendWsNotifAtUser', error);
        }
    }
    

    async updateLockAtRedirect() {
        try {
            let lockLobby = document.getElementById('lock-lobby');
            let parrentBox = lockLobby.parentNode;
            lockLobby.remove();
            let redirect = document.createElement('button');
            redirect.className = 'lock-lobby';
            redirect.id = 'redirect-btn';
            redirect.innerHTML = 'Redirect';
            parrentBox.appendChild(redirect);

            this.handlerRedirectPlayerBtn();
        } catch (error) {
            console.error('Failed to updateLockAtRedirect', error);
        }
    }

}

export default lobbyOwnerManager;