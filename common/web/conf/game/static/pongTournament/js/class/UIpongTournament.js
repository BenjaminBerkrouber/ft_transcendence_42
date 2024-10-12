import ILobby from "./ILobby.js";

class UIpongTournament {
    constructor() {
        this.userId = null; 
        this.lobbys = [];
    }

    init(userData, lobbysData) {
        this.userId = userData.id;
        this.lobbys = lobbysData.data.map(lobbyData => {
            const lobby = new ILobby();
            lobby.init(lobbyData, this.userId);
            return lobby;
        });
        this.handlersCreateLobby();
    }


    async handlersCreateLobby() {
        try {
            let newTournamentBtn = document.getElementById('pongTournament-btn');
            if (!newTournamentBtn) return;
            newTournamentBtn.addEventListener('click', this.innerNewLobbyForm.bind(this));
        } catch (error) {
            console.error('Failed to handlersCreateLobby', error);
        }
    }

    innerNewLobbyForm() {
        try {
            let pongTournamentForm = document.getElementById('pongTournament-form');
            if (!pongTournamentForm) return;
            pongTournamentForm.innerHTML = `
                <div class="lobby-form-head">
                    <span>Create your Tournament</span>
                    <span id="cancel-form"><i class="fas fa-xmark"></i></span>
                </div>
                <div class="lobby-form-main">
                    <input id="lobby-name" type="text" placeholder="tournamentName" value="tournamentName">
                    <button id="submit-lobby">Create</button>
                </div>
            `;
            pongTournamentForm.style.display = 'block';
            this.handlersSubmitLobbyForm();
            this.toggleCancelLobbyForm();
        } catch (error) {
            console.error('Failed to innerNewLobbyForm', error);
        }
    }


    async handlersSubmitLobbyForm() {
        try {
            let submitBtn = document.getElementById('submit-lobby');
            if (!submitBtn) return;
            submitBtn.addEventListener('click', this.toggleSubmitForm.bind(this));
        } catch (error) {
            console.error('Failed to handlersSubmitLobbyForm', error);
        }
    }

    async toggleSubmitForm(event) {
        event.preventDefault();
        let lobbyName = document.getElementById('lobby-name').value;
        if (!/^[a-zA-Z]{3,20}$/.test(lobbyName))
            return alert('Please enter a valid name for the lobby (3-20 letters only)');
        console.log('toggleSubmitForm', lobbyName, this.userId);
        let newLobby = await APIcreateLobby(this.userId, lobbyName);
        console.log('newLobby', newLobby.data);
        let lobby = new ILobby();
        lobby.init(newLobby.data, this.userId);
        this.hideLobbyFrom()
    }

    async toggleCancelLobbyForm() {
        try {
            let cancelBtn = document.getElementById('cancel-form');
            if (!cancelBtn) return;
            cancelBtn.addEventListener('click', this.hideLobbyFrom.bind(this));
        } catch (error) {
            console.error('Failed to toggleCancelLobbyForm', error);
        }
    }

    async hideLobbyFrom() {
        try {
            let pongTournamentForm = document.getElementById('pongTournament-form');
            if (!pongTournamentForm) return;
            pongTournamentForm.style.display = 'none';
            pongTournamentForm.innerHTML = '';
        } catch (error) {
            console.error('Failed to removeLobbyFrom', error);
        }
    }
}

export default UIpongTournament;
