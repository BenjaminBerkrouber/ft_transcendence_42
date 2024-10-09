import ILobby from "./ILobby.js";

class UIpongTournament {
    constructor() {
        this.userId = null; 
        this.lobbys = [];
        this.init();
    }

    init(userData, lobbysData) {
        console.log('UIpongTournament init');
        this.userId = userData.id;
        this.lobbys = lobbysData.map(lobbyData => {
            const lobby = new ILobby();
            lobby.init(lobbyData);
            return lobby;
        });
    }

    async innerAllLobby() {
        try {
            let lobbyBox = document.getElementById('all_lobby');
            for (let i = 0; i < this.lobbys.length; i++) {
                let lobby = this.lobbys[i];
                let lobbyDiv = document.createElement('div');
                lobbyDiv.classList.add('lobby-element');
                lobbyDiv.innerHTML = `
                    <div id="${lobby.UUID}" class="lobby-element-data">
                        <span>${lobby.name}</span>
                        <div>
                            <span>${lobby.nbr_players} <i class="fa-solid fa-user"></i></span>
                            <span>${lobby.isLocked ? '🟢' : '🟡'}</span>
                        </div>
                    </div>
                `;
                if (lobby.owner === userId) {
                    lobbyDiv.innerHTML += `
                        <div class="lobby-element-btn"><span id="remove-{${lobby.UUID}}" class="remove-btn" data-lobbyUUID="${lobby.UUID}"><i class="fa-solid fa-xmark"></i></span></div>
                    `;
                }
                lobbyBox.appendChild(lobbyDiv);
            }
        } catch (error) {
            console.error('Failed to innerAllLobby', error);
        }
    }

    async handlersJoinLobby() {
        try {
            let allLobby = document.getElementsByClassName('lobby-element-data');
            for (let i = 0; i < allLobby.length; i++) {
                if (AllLobby.has(allLobby[i].id))
                    continue;
    
                allLobby[i].addEventListener('click', async function () {
                    let lobbyId = allLobby[i].id;
                    htmx.ajax('GET', `/game/pong/tournament/lobby?lobby_id=${lobbyId}`, {
                        target: '#main-content',
                        swap: 'innerHTML',
                    }).then(response => {
                        history.pushState({}, '', `/game/pong/tournament/lobby?lobby_id=${lobbyId}`);
                    });
                });
                AllLobby.add(allLobby[i].children[0].id);
            }
        } catch (error) {
            console.error('Failed to joinLobby', error);
        }
    }

}

export default UIpongTournament;
