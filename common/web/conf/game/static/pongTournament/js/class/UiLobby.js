import UIPlayerLobby from './UIPlayerLobby.js';
import UIIa from './UIIa.js';
import lobbyOwnerManager from './lobbyOwnerManager.js';
import IWs from '../../../class/IWs.js';
import IPlayerData from "../../../class/IPlayerData.js";

class UILobby {
    constructor() {
        this.playerData = null;
        this.lobbyUUID = null;
        this.lobbyName = null;
        this.owner_id = null;
        this.humanPlayers = [];
        this.aiPlayers = [];
        this.isLocked = false;
        this.createAt = null;
        this.wsLobby = null;
        this.lobbyManager = null;
    }

    async init(lobbyData, playerData) {
        console.log('lobbyData', lobbyData);
        this.playerData = new IPlayerData();
        this.playerData.init(playerData);
        this.lobbyUUID = lobbyData.UUID;
        this.lobbyName = lobbyData.name;
        this.owner_id = lobbyData.owner_id;
        this.humanPlayers = Object.values(lobbyData.human_player).map(human_player => {
            let newHuman = new UIPlayerLobby();
            newHuman.init(human_player, playerData.id);
            return newHuman;
        });
        this.aiPlayers = Object.values(lobbyData.ia_players).map(ai_players => {
            let newIa = new UIIa();
            newIa.init(ai_players);
            return newIa;
        });
        this.isLocked = lobbyData.isLocked;
        this.createAt = lobbyData.created_at;
        
        
        
        let roomName = await APIgetHashRoom(this.lobbyUUID);
        
        this.wsLobby = new IWs(roomName.roomName, 'lobby', this.processWebSocketMessage.bind(this));
        await this.wsLobby.init();
        
        
        this.wsLobby.sendToWebSocket({
            "userId": playerData.id,
            "eventType": "ping",
            "message": `${playerData.id} | ping`
        });



        if (this.owner_id == playerData.id) {
            console.log('wsLobby', this.wsLobby);
            this.lobbyManager = new lobbyOwnerManager(playerData.id, this.wsLobby, this.lobbyUUID);
        }
    }

    innerContent() {
        try {
            if (this.isLocked)
                console.log('this.isLocked', this.isLocked);
        } catch (error) {
            console.error('Failed to innerContent', error);
        }
    }

    togglePlayerLogged(userId, isLogged) {
        try {
            let player = this.humanPlayers.find(player => player.getId() == userId);
            if (!player) return;
            player.toggleLogged(isLogged);
        } catch (error) {
            console.error('Failed to setPlayerLogged', error);
        }
    }


    /**
     * Processes WebSocket messages related to the game.
     * 
     * Depending on the event type, this method invokes the appropriate action
     * 
     * @async
     * @function processWebSocketMessage
     * @param {Object} data - The data received from the WebSocket message.
     * 
     * @memberof PongPrivGameUi
     */
    async processWebSocketMessage(data) {
        try {
            let eventTypes = {
                'ping': (data) => this.ping(data),
                'pong': (data) => this.pong(data),
                'addPlayer': (data) => this.addPlayer(data),
                'addIa': (data) => this.addIa(data),
                // 'leave': (data) => this.leave(data),
                // 'ready': (data) => this.ready(data),
            };
            if (eventTypes[data.eventType]) {
                eventTypes[data.eventType](data);
            } else {
                console.error("Unknown eventType:", data.eventType);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async ping(data) {
        try {
            if (data.userId == this.playerData.getId()) return;
            this.wsLobby.sendToWebSocket({
                "userId": this.playerData.getId(),
                "eventType": "pong",
                "message": `${this.playerData.getId()} | pong`
            });
            this.togglePlayerLogged(data.userId, true);
        } catch (error) {
            console.error('Failed to ping', error);
        }
    }

    async pong(data) {
        try {
            if (data.userId == this.playerData.getId()) return;
            this.togglePlayerLogged(data.userId, true);
        } catch (error) {
            console.error('Failed to pong', error);
        }
    }

    async addPlayer(data) {
        try {
            let newUserId = data.message.split(' | ')[1];
            let user = await APIgetPlayerById(newUserId);
            let newHumanPlayer = new UIPlayerLobby();
            newHumanPlayer.init(user, this.playerData.getId());
            this.humanPlayers.push(newHumanPlayer);
            console.log('user', user);
        }catch (error) {
            console.error('Failed to addPlayer', error);
        }
    }

    async addIa(data) {
        try {
            let ia = new UIIa();
            ia.init({id: data.userId});
            this.aiPlayers.push(ia);
        } catch (error) {
            console.error('Failed to addIa', error);
        }
    }


    displayData () {
        console.log('lobbyData', this);
        console.log('lobbyUUID', this.lobbyUUID);
        console.log('lobbyName', this.lobbyName);
        console.log('owner_id', this.owner_id);
        console.log('aiPlayers', this.aiPlayers);
        console.log('humanPlayers', this.humanPlayers);
        console.log('isLocked', this.isLocked);
        console.log('createAt', this.createAt);
    }

}

export default UILobby;