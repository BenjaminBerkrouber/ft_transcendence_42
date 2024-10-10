import IPlayerData from "./IPlayerData.js";
import IGame from "./IGame.js";
import IWs from './IWs.js';

class IWsGamePongAction {

    
    // ===============================================================================================
    // =========================================== Constructor =======================================
    // ===============================================================================================


    constructor() {
        this.gameData = new IGame;
        this.playersData = new IPlayerData;
        this.wsPong = null;
    }


    // ===============================================================================================
    // ============================================= INIT ============================================
    // ===============================================================================================


    async init(userData, gameData) {
        this.playersData.init(userData);
        this.gameData.init(gameData);
        let roomName = (await APIgetHashRoom('game_' + this.gameData.getUUID())).roomName;
        this.wsPong = new IWs(roomName, 'game/pong', (message) => this.processWebSocketMessage(message));
        await this.wsPong.init();
        this.wsPong.sendToWebSocket({
            "userId": this.playersData.getId(),
            "eventType": "ping",
            "message": `${this.playersData.getId()} | ping`
        });
    }


    // ===============================================================================================
	// =================================== Ws GamePong Action  =======================================
	// ===============================================================================================


    //  UI methodre ws

    async ping(data) {
        try {
            console.log('ping');
            this.wsPong.sendToWebSocket({
                "userId": this.playersData.getId(),
                "eventType": "pong",
                "message": `${this.playersData.getId()} | pong`
            });
            let card = this.getCardsPlayerById(data.userId);
            card.isLogged = true;
            card.updateCardLogged();
            this.handleMakeReady();
        } catch (error) {
            console.error(error);
        }
    }
    

    async pong(data) {
        try {
            console.log('pong');
            let card = this.getCardsPlayerById(data.userId);
            card.isLogged = true;
            card.updateCardLogged();
            this.handleMakeReady();
        } catch (error) {
            console.error(error);
        }
    }

    async leave(data) {
        try {
            if (!this.gameData.isStarted) {
                let card = this.getCardsPlayerById(data.userId);
                card.isLogged = false;
                card.isReady = false;
                card.updateCardLogged();
                card.updateCardReady();
            } else {
                console.log('You win');
            }
        } catch (error) {
            console.error(error);
        }
    }

    async ready(data) {
        try {
            let card = this.getCardsPlayerById(data.userId);
            card.isReady = true;
            card.updateCardReady();
            if (this.isAllPlayersReady()) {
                this.wsPong.sendToWebSocket({
                    "userId": -1,
                    "eventType": "startUI",
                    "message": `-1 | startGame`
                });
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    async startUI(data) {
        try {
            console.log('startUI');
            this.gameData.isStarted = true;
            await this.startInstance();
        } catch (error) {
            console.error(error);
        }
    }

    // Game Methodre WS

    async start(data) {
        try {
            console.log('start');
        } catch (error) {
            console.error(error);
        }
    }

    async move(data) {
        try {
            console.log('[WS-G]=>(' + data.message + ')');
        } catch (error) {
            console.error(error);
        }
    }
    
    async moveBall(data) {
        try {
            console.log('[WS-G]=>(' + data.message + ')');
        } catch (error) {
            console.error(error);
        }
    }

    async info(data) {
        try {
            console.log('[WS-G]=>(' + data.message + ')');
        } catch (error) {
            console.error(error);
        }
    }

    async end(data) {
        try {
            console.log('[WS-G]=>(' + data.message + ')');
        } catch (error) {
            console.error(error);
        }
    }
}

export default IWsGamePongAction;