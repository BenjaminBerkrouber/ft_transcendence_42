
class UIPlayerLobby {
    constructor() {
        this.id = null;
        this.isLogged = true;
    }

    init(iaData) {
        this.id = iaData.id;
        this.innerPlayer();
    }

    innerPlayer() {
        try {
            let parrentBox = document.getElementById('slop-content');
            let newPlayer = document.createElement('div');
            newPlayer.classList.add('player-slot');
            newPlayer.classList.add('player-present');
            newPlayer.id = `ia-${this.id}`;
            newPlayer.innerHTML = `
                <div class="player-data">
                    <img src="https://www.forbes.fr/wp-content/uploads/2017/01/intelligence-artificielle-872x580.jpg.webp" alt="pp">
                    <div class="player-status-online online"></div>
                    <span>IA</span>
                </div>
                <div class="player-status"><div class="waiting-player"></div></div>
            `;
            parrentBox.appendChild(newPlayer);
        } catch (error) {
            console.error('Failed to innerPlayer', error);
        }
    }
}

export default UIPlayerLobby;