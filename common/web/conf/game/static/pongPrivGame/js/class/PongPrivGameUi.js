import IWsGamePongAction from '../../../class/IWsGamePongAction.js'
import ICardPlayer from './ICardPlayer.js';

/**
 * PongPrivGameUi class.
 * 
 * This class manages the UI for private Pong games. It extends the base class `IWsGamePongAction`,
 * and handles the initialization of player cards, managing the ready state, and starting the game instance.
 * It also processes WebSocket messages related to game events such as player moves and game state updates.
 * 
 * @class PongPrivGameUi
 * 
 * @property {Array<ICardPlayer>} cards - Array of player card instances, each representing a player in the game.
 * 
 * @extends IWsGamePongAction
 * 
 * @memberof PongPrivGameUi
 */
class PongPrivGameUi extends IWsGamePongAction {


    // ===============================================================================================
    // =========================================== Constructor =======================================
    // ===============================================================================================


    /**
     * PongPrivGameUi class constructor.
     * 
     * Initializes an empty array of player cards.
     * 
     * @constructor
     * 
     * @property {Array<ICardPlayer>} cards - Array of player card instances, each representing a player in the game.
     * 
     * @memberof PongPrivGameUi
     */
    constructor() {
        super();
        this.cards = [];
    }


    // ===============================================================================================
    // ============================================= INIT ============================================
    // ===============================================================================================


    /**
     * Initializes the game UI with user and game data.
     * 
     * This method calls the parent class's `init` method, and then creates a player card for each player
     * in the game. The card data includes the player ID, username, and avatar image, and the card UI is rendered.
     * 
     * @async
     * @function init
     * @param {Object} userData - Data about the current user.
     * @param {Object} gameData - Data about the current game.
     * 
     * @memberof PongPrivGameUi
     */
    async init(userData, gameData) {
        super.init(userData, gameData);

        for (let i = 0; i < this.gameData.getNbrPlayers(); i++) {
            this.cards.push(new ICardPlayer(
                this.gameData.getPlayers()[i].getId(),
                this.gameData.getPlayers()[i].getUsername(),
                this.gameData.getPlayers()[i].getImg(),
                this.gameData.getPlayers()[i].getId() == this.playersData.getId(),
                false
            ));
            this.cards[i].innerCardPlayer();
        }
    }


    // ===============================================================================================
    // ======================================= handle Element ========================================
    // ===============================================================================================


    /**
     * Handles the visibility and click event of the "Make Ready" button.
     * 
     * This method checks if all players are logged in, and if so, displays the button. 
     * When the button is clicked, it toggles the player's ready state and notifies the server via WebSocket.
     * 
     * @async
     * @function handleMakeReady
     * 
     * @throws {Error} - Logs an error if the button is not found or if there's an issue handling the ready state.
     * 
     * @memberof PongPrivGameUi
     */
    async handleMakeReady() {
        try {
            let btnMakeReady = document.getElementById('btn-make-ready');
            if (!btnMakeReady) return;
            btnMakeReady.style.display = this.isAllPlayerLogged() ? 'block' : 'none';
            if (!this.isAllPlayerLogged()) return;
            btnMakeReady.addEventListener('click', () => this.toggleReadyState());
        } catch (error) {
            console.error(error);
        }
    }


    // ===============================================================================================
    // ======================================= toggle Element ========================================
    // ===============================================================================================


    /**
     * Toggles the ready state of the current player.
     * 
     * This method updates the current player's card to indicate they are ready, and sends a WebSocket
     * message to notify the server that the player is ready.
     * 
     * @function toggleReadyState
     * 
     * @memberof PongPrivGameUi
     */
    async toggleReadyState() {
        let card = this.getCardsPlayerById(this.playersData.getId());
        if (card.isReady) return;
        card.isReady = true;
        card.updateCardReady();
        this.wsPong.sendToWebSocket({
            "userId": this.playersData.getId(),
            "eventType": "ready",
            "message": `${this.playersData.getId()} | ready`
        });
        let btnMakeReady = document.getElementById('btn-make-ready');
        btnMakeReady.style.display = 'none';
    }


    // ===============================================================================================
    // ======================================= Game Methodes  ========================================
    // ===============================================================================================


    /**
     * Starts the Pong game instance.
     * 
     * This method clears the 3D Pong container, hides the footer, and retrieves the players' IDs for game initialization.
     * 
     * @async
     * @function startInstance
     * 
     * @throws {Error} - Logs an error if the game container or player data is not properly initialized.
     * 
     * @memberof PongPrivGameUi
     */
    async startInstance() {
        try {
            let box = document.getElementById('container-pong3D');
            box.innerHTML = '';
            document.getElementById('footer').style.display = 'none';
            let playersIds = this.gameData.getPlayers().map(player => player.getId());            
            // game = new Game();
            // startGame([{ id: p1Id }, { id: p2Id }], game, { userId });
            // toggleMovePlayer(userId);
        } catch (error) {
            console.error(error);
        }
    }


    // ===============================================================================================
    // ========================================== Utils  =============================================
    // ===============================================================================================


    /**
     * Checks if all players are logged in.
     * 
     * @function isAllPlayerLogged
     * @returns {boolean} - Returns true if all players are logged in, false otherwise.
     * 
     * @memberof PongPrivGameUi
     */
    isAllPlayerLogged() {
        return this.cards.every(card => card.isLogged);
    }

    /**
     * Checks if all players are ready.
     * 
     * @function isAllPlayersReady
     * @returns {boolean} - Returns true if all players are ready, false otherwise.
     * 
     * @memberof PongPrivGameUi
     */
    isAllPlayersReady() {
        return this.cards.every(card => card.isReady);
    }

    /**
     * Processes WebSocket messages related to the game.
     * 
     * Depending on the event type, this method invokes the appropriate action, such as pinging, moving the ball,
     * or handling the start of the game.
     * 
     * @async
     * @function processWebSocketMessage
     * @param {Object} data - The data received from the WebSocket message.
     * 
     * @memberof PongPrivGameUi
     */
    async processWebSocketMessage(data) {
        try {
            if (data.userId == this.playersData.getId()) return;
            let eventTypes = {
                'ping': (data) => this.ping(data),
                'pong': (data) => this.pong(data),
                'leave': (data) => this.leave(data),
                'ready': (data) => this.ready(data),
                'startUI': (data) => this.startUI(data),
                'move': (data) => this.move(data),
                'start': (data) => this.start(data),
                'moveBall': (data) => this.moveBall(data),
                'info': (data) => this.info(data),
                'end': (data) => this.end(data)
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

    /**
     * Retrieves a player's card by their ID.
     * 
     * @function getCardsPlayerById
     * @param {number} id - The ID of the player whose card is to be retrieved.
     * @returns {ICardPlayer|null} - The player card object, or null if not found.
     * 
     * @memberof PongPrivGameUi
     */
    getCardsPlayerById(id) {
        try {
            for (let i = 0; i < this.cards.length; i++)
                if (this.cards[i].id == id)
                    return this.cards[i];
            return null;
        } catch (error) {
            console.error(error);
        }
    }
}

export default PongPrivGameUi;
