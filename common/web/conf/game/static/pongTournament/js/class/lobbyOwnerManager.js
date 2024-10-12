class lobbyOwnerManager {
    constructor(ownerId, wsLobby, lobbyUUID) {
        this.wsLobby = wsLobby;
        this.ownerId = ownerId;
        this.lobbyUUID = lobbyUUID;
        this.availableUsers = [];
        this.init();
    }

    async init() {
        try {
            this.availableUsers = await APIgetAvailableUserToLobby(this.lobbyUUID);
            console.log('availableUsers', this.availableUsers);
            this.innerContent();
        } catch (error) {
            console.error('Failed to init', error);
        }
    }

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
                await APIaddIaToLobby(this.lobbyUUID);
                this.wsLobby.sendToWebSocket({
                    "userId": this.ownerId,
                    "eventType": "addIa",
                    "message": `addIa | 0`
                });
                this.displayNewPlayerForm();
            });
        } catch (error) {
            console.error('Failed to handlersChosePlayer', error);
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
                await APIaddPlayerToLobby(this.lobbyUUID, user.id);
                this.hideSelectPlayerForm();
                this.wsLobby.sendToWebSocket({
                    "userId": this.ownerId,
                    "eventType": "addPlayer",
                    "message": `addPlayer | ${user.id}`
                });
            });
        } catch (error) {
            console.error('Failed to innerPlayerFound', error);
        }
    }

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

}

export default lobbyOwnerManager;