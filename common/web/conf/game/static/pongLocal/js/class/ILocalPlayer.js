/**
 * ILocalPlayer class.
 * 
 * This class manages the local player's controls and information in a game environment. 
 * It handles the player's name, control settings (up and down keys), and provides methods to update and log control states.
 * 
 * @class ILocalPlayer
 * 
 * @property {string} name - The player's username retrieved from the input field.
 * @property {string} img - The URL of the player's profile picture (initially null).
 * @property {string} ctrl_up - The key code for moving up, retrieved from the "data-ctrl" attribute.
 * @property {string} ctrl_down - The key code for moving down, retrieved from the "data-ctrl" attribute.
 * 
 * @memberof ILocalPlayer
 */
class ILocalPlayer {


    // ===============================================================================================
    // =========================================== Constructor =======================================
    // ===============================================================================================


    /**
     * ILocalPlayer class constructor.
     * 
     * Initializes a new local player object with control settings for up and down movement.
     * 
     * @constructor
     * @param {string} playerId - The unique identifier for the player, used to fetch the player's information from the DOM.
     * 
     * @property {string} name - The player's username, retrieved from the corresponding input field.
     * @property {string} img - Initially set to null; can be updated with a profile picture URL.
     * @property {string} ctrl_up - The key code for moving the player up, retrieved from the element's "data-ctrl" attribute.
     * @property {string} ctrl_down - The key code for moving the player down, retrieved from the element's "data-ctrl" attribute.
     * 
     * @memberof ILocalPlayer
     */
    constructor(playerId) {
        this.name = document.getElementById(`${playerId}_username`).value;
        this.img = null;
        this.ctrl_up = document.getElementById(`${playerId}-ctrl-up`).getAttribute('data-ctrl');
        this.ctrl_down = document.getElementById(`${playerId}-ctrl-down`).getAttribute('data-ctrl');
    }


    // ===============================================================================================
    // ======================================= Methods ===============================================
    // ===============================================================================================


    /**
     * Updates the player's control settings.
     * 
     * Modifies the player's control for either up or down movement based on the control passed as an argument.
     * 
     * @function updateControl
     * 
     * @param {string} control - The control type to update, either 'up' or 'down'.
     * @param {string} keyCode - The new key code assigned to the specified control.
     * 
     * @memberof ILocalPlayer
     */
    updateControl(control, keyCode) {
        if (control === 'up') {
            this.ctrl_up = keyCode;
        } else if (control === 'down') {
            this.ctrl_down = keyCode;
        }
    }

}

export default ILocalPlayer; 