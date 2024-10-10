import ILocalPlayer from './ILocalPlayer.js';
// import { startGame } from '../../../pong3D/js/local/pong3D.js';
import { serializeCustomGame } from '../../../pongCustom/js/serializeCustomGame.js'

/**
 * PongLocalUi class.
 * 
 * This class handles the UI interactions for the local Pong game. It manages player control inputs, 
 * starting the game, and custom game settings. The class interacts with the `ILocalPlayer` class to 
 * manage the local players and updates their controls dynamically.
 * 
 * @class PongLocalUi
 * 
 * @property {ILocalPlayer} player1 - The first local player.
 * @property {ILocalPlayer} player2 - The second local player.
 * @property {Array} pongCustom - Custom game settings, initialized as an empty array.
 * 
 * @memberof PongLocalUi
 */
class PongLocalUi {


    // ===============================================================================================
    // =========================================== Constructor =======================================
    // ===============================================================================================


    /**
     * PongLocalUi class constructor.
     * 
     * Initializes a new instance of PongLocalUi, sets up the players and triggers UI initialization.
     * 
     * @constructor
     * 
     * @property {ILocalPlayer} player1 - The first player object, initialized with the ID 'player1'.
     * @property {ILocalPlayer} player2 - The second player object, initialized with the ID 'player2'.
     * @property {Array} pongCustom - Custom game settings (initialized as an empty array).
     * 
     * @memberof PongLocalUi
     */
    constructor() {
        this.pongCustom = [];
        this.player1 = new ILocalPlayer('player1');
        this.player2 = new ILocalPlayer('player2');

        this.init();
    }


    // ===============================================================================================
    // =============================================== Init ==========================================
    // ===============================================================================================


    /**
     * Initializes the UI and event handlers for player controls and game start.
     * 
     * @async
     * @function init
     * 
     * @memberof PongLocalUi
     */
    async init() {
        // let reps = await APIgetSessionPongCustomGame();
        // if (reps.status) {
        //     this.pongCustom = await serializeCustomGame(pongCustom);
        //     await APIsaveCustomAtSession(pongCustom);
        // }
        // else
        //     this.pongCustom = reps.customGame;

        this.handlersChangeControlls();
        this.handlersStartGame();
        this.handlersCustomGame();
    }


    // ===============================================================================================
	// ======================================= handle Element ========================================
	// ===============================================================================================


    /**
     * Sets up event handlers for changing player controls dynamically.
     * 
     * @function handlersChangeControlls
     * 
     * @throws {Error} - Logs an error if control buttons are not found or there is an issue in adding the event listener.
     * 
     * @memberof PongLocalUi
     */
    handlersChangeControlls() {
        try {
            const btnsChangeControls = document.querySelectorAll('.btn-change-controls');
            btnsChangeControls.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.toggleChangeControlls(btn);
                });
            });
        } catch (e) {
            console.error(`error handlersChangeControlls ${e}`);
        }
    }


    /**
     * Sets up event handlers for starting a custom game.
     * 
     * Redirects the player to the custom game interface if the custom game button is clicked.
     * 
     * @function handlersCustomGame
     * 
     * @throws {Error} - Logs an error if the custom game element is not found.
     * 
     * @memberof PongLocalUi
     */
    handlersCustomGame() {
        try {
            let customGame = document.getElementById('curstom-game');
            if (!customGame) return;
            customGame.addEventListener('click', async () => {
                window.location.href = '/game/pong/custom/?data-url=/game/pong/local/'; // A FAIRE
            });
        } catch (error) {
            console.error(error);
        }
    }


    /**
     * Sets up the event handler for starting the game.
     * 
     * When clicked, the start button prepares the game by adjusting the player's names, updating the UI, 
     * and initiating the game logic (currently commented out).
     * 
     * @function handlersStartGame
     * 
     * @throws {Error} - Logs an error if the start game element or its components are not found.
     * 
     * @memberof PongLocalUi
     */
    handlersStartGame() {
        try {
            let startGameBox = document.getElementById('start-game');
            startGameBox.addEventListener('click', () => {
                let name1 = this.player1.name;
                let name2 = this.player2.name;
                if (name1.length > name2.length) {
                    name2 += '  '.repeat(name1.length - name2.length) + '.';
                } else if (name1.length < name2.length) {
                    name1 = '.' + '  '.repeat(name2.length - name1.length) + name1;
                }
                let nameBord = name1 + ' '.repeat(14) + name2;
                console.log('nameBord => ', nameBord);
                
                let box = document.getElementById('container-pong3D');
                box.innerHTML = '';
                document.getElementById('footer').style.display = 'none';
                // startGame(this.player1, this.player2, nameBord, this.pongCustom); // A FAIRE
            });
        } catch (error) {
            console.error(error);
        }
    }


    // ===============================================================================================
	// ======================================= toggle Element ========================================
	// ===============================================================================================


    /**
     * Toggles control change mode for players by listening for keypresses and updating the control button content.
     * 
     * @function toggleChangeControlls
     * 
     * @param {HTMLElement} btn - The button element that was clicked to trigger control change.
     * 
     * @memberof PongLocalUi
     */
    toggleChangeControlls(btn) {
        document.addEventListener('keydown', (event) => {
            event.preventDefault();
            let key = event.key.toUpperCase();
            if (!this.isControllUsed(event.keyCode))
                this.updateButtonContent(btn, key, event.keyCode);
        }, { once: true });
    }


    // ===============================================================================================
    // ========================================== Utils  =============================================
    // ===============================================================================================


    /**
     * Checks if a control key is already assigned to another button.
     * 
     * @function isControllUsed
     * 
     * @param {number} keyCode - The key code of the control key being checked.
     * @returns {boolean} - Returns true if the control is already in use.
     * 
     * @memberof PongLocalUi
     */
    isControllUsed(keyCode) {
        let keysInUse = Array.from(document.querySelectorAll('.btn-change-controls'))
                            .map(btn => btn.getAttribute('data-ctrl'));
        return keysInUse.includes(keyCode.toString());
    }

    /**
     * Updates the control button content with the new key and assigns the corresponding control to the player.
     * 
     * @function updateButtonContent
     * 
     * @param {HTMLElement} btn - The button element whose content needs to be updated.
     * @param {string} key - The key to be displayed on the button.
     * @param {number} keyCode - The key code of the new control key.
     * 
     * @memberof PongLocalUi
     */
    updateButtonContent(btn, key, keyCode) {
        const control = btn.id.includes('up') ? 'up' : 'down';
        if (/^[A-Z]$/.test(key) || ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT'].includes(key)) {
            btn.innerHTML = this.getDisplayKey(key);
            btn.setAttribute('data-ctrl', keyCode);
            this.updatePlayerControls(btn, control, keyCode);
        }
    }

    /**
     * Updates the player's control settings for either "up" or "down" movement.
     * 
     * @function updatePlayerControls
     * 
     * @param {HTMLElement} btn - The button element for the player whose controls are being updated.
     * @param {string} control - Specifies whether the control being updated is for 'up' or 'down' movement.
     * @param {number} keyCode - The new key code to be assigned to the control.
     * 
     * @memberof PongLocalUi
     */
    updatePlayerControls(btn, control, keyCode) {
        if (btn.id.includes('player1'))
            this.player1.updateControl(control, keyCode);
        else if (btn.id.includes('player2'))
            this.player2.updateControl(control, keyCode);
    }

    /**
     * Transforms key codes like "ArrowUp" or "ArrowDown" into their respective symbols for display.
     * 
     * @function getDisplayKey
     * 
     * @param {string} key - The key being pressed, as returned by the event.
     * @returns {string} - Returns the corresponding symbol or key string.
     * 
     * @memberof PongLocalUi
     */
    getDisplayKey(key) {
        const arrows = {
            'ARROWUP': '↑',
            'ARROWDOWN': '↓',
            'ARROWLEFT': '←',
            'ARROWRIGHT': '→'
        };
        return arrows[key] || key;
    }

}

export default PongLocalUi;