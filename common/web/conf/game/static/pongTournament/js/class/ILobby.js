class ILobby {
    constructor() {
        this.lobbyUUID = null;
        this.lobbyName = null;
        this.owner_id = null;
        this.Humanplayers = [];
        this.aiPlayers = [];
        this.isLocked = false;
        this.createAt = null;
        this.parrentBox = document.getElementById('all_lobby');
    }

    init(lobbyData, currentUserId) {
        this.lobbyUUID = lobbyData.UUID;
        this.lobbyName = lobbyData.name;
        this.owner_id = lobbyData.owner_id;
        this.Humanplayers = lobbyData.players_ids;
        this.aiPlayers = lobbyData.ia_players_ids;
        this.isLocked = lobbyData.isLocked;
        this.createAt = lobbyData.created_at;
        this.innerLobby(currentUserId);
    }

    innerLobby(currentUserId) {
        try {    
            let lobbyDiv = document.createElement('div');
            lobbyDiv.classList.add('lobby-element');
            lobbyDiv.innerHTML = `
                <div id="${this.lobbyUUID}" class="lobby-element-data">
                    <span>${this.lobbyName}</span>
                    <div>
                        <span>${this.get_nbr_players()} <i class="fa-solid fa-user"></i></span>
                        <span>${this.isLocked ? '🟢' : '🟡'}</span>
                    </div>
                </div>
            `;
            if (this.owner_id == currentUserId)
                lobbyDiv.innerHTML += `<div class="lobby-element-btn"><span id="remove-{${this.lobbyUUID}}" class="remove-btn" data-lobbyUUID="${this.lobbyUUID}"><i class="fa-solid fa-xmark"></i></span></div>`;
            this.parrentBox.appendChild(lobbyDiv);
            this.handlersJoinLobby();
            if (this.owner_id == currentUserId)
                this.handlersRemoveLobby();
        } catch (error) {
            console.error('Failed to innerLobby', error);
        }
    }

    handlersJoinLobby() {
        try {
            let lobbyElement = document.getElementById(this.lobbyUUID);
            lobbyElement.addEventListener('click', async () => {
                console.log('joinLobby', this.lobbyUUID);
                window.location.href = `/game/pong/tournament/lobby?lobby_id=${this.lobbyUUID}`;
            });
        } catch (error) {
            console.error('Failed to joinLobby', error);
        }
    }

    handlersRemoveLobby() {
        try {
            let removeBtn = document.getElementById(`remove-{${this.lobbyUUID}}`);
            removeBtn.addEventListener('click', async () => {
                console.log('removeLobby', this.lobbyUUID);
                let reps = await APIremoveLobby(this.lobbyUUID);
                console.log('reps', reps);
                this.removeLobby();
            });
        } catch (error) {
            console.error('Failed to removeLobby', error);
        }
    }


    removeLobby() {
        try {
            let lobbyElement = document.getElementById(this.lobbyUUID);
            if (!lobbyElement) return;
            let parrentBox = lobbyElement.parentElement;
            if (!parrentBox) return
            console.log('removeLobby', parrentBox);
            parrentBox.remove();
        } catch (error) {
            console.error('Failed to removeLobby', error);
        }
    }

    get_nbr_players() {
        return this.Humanplayers.length + this.aiPlayers.length;
    }

    printData() {
        console.log('lobbyUUID', this.lobbyUUID);
        console.log('lobbyName', this.lobbyName);
        console.log('owner_id', this.owner_id);
        console.log('Humanplayers', this.Humanplayers);
    }
}

export default ILobby;