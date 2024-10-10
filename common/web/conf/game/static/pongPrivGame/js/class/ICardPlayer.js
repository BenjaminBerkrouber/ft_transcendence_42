/**
 * ICardPlayer class.
 * 
 * This class manages the display and updating of player cards within a game interface.
 * Each player card displays the player's username, avatar, and their logged-in and ready status.
 * 
 * @class ICardPlayer
 * 
 * @property {number} id - The unique identifier for the player.
 * @property {string} username - The username of the player.
 * @property {string} img - The URL of the player's profile picture.
 * @property {boolean} isLogged - Indicates whether the player is logged in or not.
 * @property {boolean} isReady - Indicates whether the player is ready for the game.
 * 
 * @memberof ICardPlayer
 */
class ICardPlayer {


    // ===============================================================================================
    // =========================================== Constructor =======================================
    // ===============================================================================================


    /**
     * ICardPlayer class constructor.
     * 
     * Initializes a new player card with the provided details.
     * 
     * @constructor
     * @param {number} id - The unique identifier for the player.
     * @param {string} username - The player's username.
     * @param {string} img - The URL of the player's profile picture.
     * @param {boolean} isLogged - Whether the player is logged in.
     * @param {boolean} isReady - Whether the player is ready for the game.
     * 
     * @property {number} id - The unique identifier for the player.
     * @property {string} username - The username of the player.
     * @property {string} img - The URL of the player's profile picture.
     * @property {boolean} isLogged - Indicates whether the player is logged in or not.
     * @property {boolean} isReady - Indicates whether the player is ready for the game.
     * 
     * @memberof ICardPlayer
     */
    constructor(id, username, img, isLogged, isReady) {
        this.id = id;
        this.username = username;
        this.img = img;
        this.isLogged = isLogged;
        this.isReady = isReady;
    }


    // ===============================================================================================
	// ======================================= Inner Element =========================================
	// ===============================================================================================


    /**
     * Adds the player's card to the game interface.
     * 
     * Creates a player card element and inserts it into the "box_player" container on the page.
     * The card includes the player's username, profile picture, and their current status.
     * 
     * @async
     * @function innerCardPlayer
     * 
     * @throws {Error} - Logs an error if the "box_player" element is not found.
     * 
     * @memberof ICardPlayer
     */
    async innerCardPlayer() {
        try {
            let boxPlayer = document.getElementById('box_player');
            if (!boxPlayer) return;
            let cardPlayer = document.createElement('div');
            cardPlayer.className = 'box-player';
            cardPlayer.id = `player_${this.id}`;
            cardPlayer.innerHTML = `
                <div class="player-box__username ${this.isLogged ? '' : 'notLog'}">
                    <span class="username">${this.username}</span>
                    <img src="${this.img}" alt="pp">
                    <span class="status">Not Ready</span>
                </div>
                ${this.isLogged ? '' : `<div id="loader-container"><div class="loader"></div></div>`}
            `;
            boxPlayer.appendChild(cardPlayer);
        } catch (error) {
            console.error('error in innerCardPlayer', error);
        }
    }


    // ===============================================================================================
    // ========================================== Utils  =============================================
    // ===============================================================================================


    /**
     * Updates the player's card to reflect their logged-in status.
     * 
     * Changes the player's card display depending on whether the player is logged in. 
     * If not logged in, a loader is shown; otherwise, it is hidden.
     * 
     * @async
     * @function updateCardLogged
     * 
     * @throws {Error} - Logs an error if the player card or its elements are not found.
     * 
     * @memberof ICardPlayer
     */
    async updateCardLogged() {
        try {
            let playerBox = document.getElementById(`player_${this.id}`);
            if (!playerBox) return;
            let usernameElement = playerBox.querySelector('.player-box__username');
            const hasNotLogClass = usernameElement.classList.contains('notLog');
            this.isLogged ? hasNotLogClass && usernameElement.classList.remove('notLog') : !hasNotLogClass && usernameElement.classList.add('notLog');
            let loaderContainer = playerBox.querySelector('#loader-container');
            this.isLogged ? loaderContainer.style.display = 'none' : loaderContainer.style.display = 'block';
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Updates the player's readiness status on the card.
     * 
     * Changes the "Ready" or "Not Ready" status displayed on the player's card based on their readiness.
     * 
     * @async
     * @function updateCardReady
     * 
     * @throws {Error} - Logs an error if the player card or its elements are not found.
     * 
     * @memberof ICardPlayer
     */
    async updateCardReady() {
        try {
            let playerBox = document.getElementById(`player_${this.id}`);
            if (!playerBox) return;
            playerBox.querySelector('.player-box__username').querySelector('.status').innerHTML = this.isReady ? 'Ready' : 'Not Ready';
        } catch (error) {
            console.error(error);
        }
    }

    printData() {
        console.log('username', this.username);
        console.log('img', this.img);
        console.log('isLogged', this.isLogged);
        console.log('isReady', this.isReady);
    }
}

export default ICardPlayer;