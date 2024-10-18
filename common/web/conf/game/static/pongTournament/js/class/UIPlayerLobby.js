import IPlayerData from "../../../class/IPlayerData.js";

class UIPlayerLobby extends IPlayerData {
    constructor() {
        super();

        this.isLogged = false;
    }

    init(playerData, currentUserId) {
        super.init(playerData);
        if (this.getId() == currentUserId)
            this.isLogged = true;
    }

    innerPlayer() {
        try {
            let parrentBox = document.getElementById('slop-content');
            let newPlayer = document.createElement('div');
            newPlayer.classList.add('player-slot');
            newPlayer.classList.add('player-present');
            newPlayer.id = `player-${this.id}`;
            newPlayer.innerHTML = `
                <div class="player-data">
                    <img src="${this.getImg()}" alt="pp">
                    <div class="player-status-online online"></div>
                    <span>${this.getUsername()}</span>
                </div>
                <div class="player-status">
                    ${this.isLogged ? '<div class="waiting-player"></div>' : '<div class="pending-player"></div>'}
                </div>
            `;
            parrentBox.appendChild(newPlayer);
        } catch (error) {
            console.error('Failed to innerPlayer', error);
        }
    }

    toggleLogged(isLogged) {
        try {
            this.isLogged = isLogged;
            let player = document.getElementById(`player-${this.id}`);
            let playerStatus = player.querySelector('.player-status');
            playerStatus.innerHTML = isLogged ? '<div class="waiting-player"></div>' : '<div class="pending-player"></div>';
        } catch (error) {
            console.error('Failed to toggleLogged', error);
        }
    }
}

export default UIPlayerLobby;