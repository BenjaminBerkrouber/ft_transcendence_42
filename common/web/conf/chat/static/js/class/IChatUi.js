/**
 * IChatUi class.
 * 
 * This class serves as an interface for managing chat-related UI functionalities
 * within the chat application. It provides methods for displaying and hiding 
 * different chat menus and panels.
 * 
 * @class IChatUi
 * 
 * @extends Object
 * 
 * @memberof IChatUi
 */
class IChatUi {


    // ===============================================================================================
    // =========================================== Constructor =======================================
    // ===============================================================================================


    /**
     * IChatUi class constructor.
     * 
     * Initializes the IChatUi instance. This constructor is intended to be 
     * overridden in subclasses for specific UI functionalities.
     * 
     * @memberof IChatUi
     */
    constructor() {

    }


    // ===============================================================================================
    // ============================================= INIT ============================================
    // ===============================================================================================


    /**
     * Initializes the chat UI components.
     * 
     * This method can be used to set up event listeners or fetch necessary 
     * data for the chat UI. Intended to be overridden in subclasses.
     * 
     * @async
     * @function init
     * 
     * @memberof IChatUi
     */
    init() {

    }


    // ===============================================================================================
    // ======================================= Inner Element =========================================
    // ===============================================================================================


    /**
     * Sets up the inner chat menus in the UI.
     * 
     * This method renders the HTML for the chat menus, including the chat header,
     * contacts list, and chat input areas.
     * 
     * @async
     * @function innerChatMenus
     * 
     * @throws {Error} Logs an error if setting up chat menus fails.
     * 
     * @memberof IChatUi
     */
    async innerChatMenus() {
        try {
            let chatMenus = document.getElementById('pannel');
            chatMenus.innerHTML = `
                <div id="chat-container">
                    <div id="chat-panel">
                        <div id="chat-header">
                            <div class="chat-head-info">
                                <h3>Contacts</h3>
                                <button id="close-btn" class="btn btn-link"><i class="fa-solid fa-xmark"></i></button>
                                <button id="back-btn" class="btn btn-link" style="display: none;"><i
                                        class="fa-solid fa-right-long"></i></button>
                            </div>
                        </div>
                        <div id="header-divider" style="display: none;"></div>
                        <div id="contacts-list">
                        </div>
                        <div id="chat-box" style="display: none;">
                            <div id="chat-messages"></div>
                            <div id="chat-input">
                                <input type="text" id="message-input" placeholder="Tapez votre message...">
                                <button id="send-btn"><i class="fas fa-paper-plane"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Failed to innerChatMenus', error);
        }
    }

    /**
     * Sets up the inner social panel in the UI.
     * 
     * This method renders the HTML for the social panel, displaying social users and 
     * their statuses. It also sets up event listeners for social interactions.
     * 
     * @async
     * @function innerSocialPannel
     * 
     * @throws {Error} Logs an error if setting up the social panel fails.
     * 
     * @memberof IChatUi
     */
    async innerSocialPannel() {
        try {
            const socialMenu = document.getElementById('pannel');
            socialMenu.innerHTML = `
                <div id="social-container">
                    <div id="social-panel">
                        <div id="social-header">
                            <div class="social-head-info">
                                <h3>Social</h3>
                                <button id="social-close-btn" class="btn btn-link"><i class="fa-solid fa-xmark"></i></button>
                            </div>
                        </div>
                        <div id="profile-info">
                            <div id="profile-info">
                                <div id="social-list" class="profile-info-item"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            const anchors = document.getElementById("social-header").querySelectorAll('a');
            anchors.forEach(anchor => {
                anchor.addEventListener('click', async (event) => {
                    event.preventDefault();
                    let href = event.currentTarget.href;
                    htmx.ajax('GET', href, {
                        target: '#main-content',
                        swap: 'innerHTML',
                    }).then(response => {
                        history.pushState({}, '', href);
                    });
                });
            });
        } catch (error) {
            console.error('Failed to innerSocialMenus', error);
        }
    }


    // ===============================================================================================
    // ======================================= Display Element =======================================
    // ===============================================================================================


    /**
     * Displays the pre-menu in the UI.
     * 
     * This method adds the 'active' class to the pre-menu to make it visible.
     * 
     * @async
     * @function displayMenus
     * 
     * @throws {Error} Logs an error if displaying the menus fails.
     * 
     * @memberof IChatUi
     */
    async displayMenus() {
        try {
            let preMenus = document.getElementById('pre-menu');
            preMenus.classList.add('active');
        } catch (error) {
            console.error('Failed to displayMenus', error);
        }
    }

    /**
     * Displays the sub-menus in the UI.
     * 
     * This method adds the 'active' class to the radial menu to make it visible.
     * 
     * @async
     * @function displaySubMenus
     * 
     * @throws {Error} Logs an error if displaying the sub-menus fails.
     * 
     * @memberof IChatUi
     */
    async displaySubMenus() {
        try {
            let radialMenu = document.getElementById('radial-menu');
            radialMenu.classList.add('active');
        } catch (error) {
            console.error('Failed to displaySubMenus', error);
        }
    }

    /**
     * Displays the chat menus in the UI.
     * 
     * This method adds the 'active' class to the chat panel to make it visible.
     * 
     * @async
     * @function displayChatMenus
     * 
     * @throws {Error} Logs an error if displaying the chat menus fails.
     * 
     * @memberof IChatUi
     */
    async displayChatMenus() {
        try {
            const chatContainer = document.getElementById('chat-panel');
            chatContainer.classList.add('active');
        } catch (error) {
            console.error('Failed to displayChatMenus', error);
        }
    }

    /**
     * Displays the social panel in the UI.
     * 
     * This method adds the 'active' class to the social container to make it visible.
     * 
     * @async
     * @function displaySocialPannel
     * 
     * @throws {Error} Logs an error if displaying the social panel fails.
     * 
     * @memberof IChatUi
     */
    async displaySocialPannel() {
        try {
            const socialContainer = document.getElementById('social-container');
            socialContainer.classList.add('active');
        } catch (error) {
            console.error('Failed to displaySocialPannel', error);
        }
    }


    // ===============================================================================================
    // ======================================= Hide Element ==========================================
    // ===============================================================================================


    /**
     * Hides the panel in the UI.
     * 
     * This method removes the 'active' class from the panel and clears its content.
     * 
     * @async
     * @function hidePanel
     * 
     * @throws {Error} Logs an error if hiding the panel fails.
     * 
     * @memberof IChatUi
     */
    async hidePanel() {
        try {
            const pannel = document.getElementById('pannel');
            pannel.classList.remove('active');
            pannel.innerHTML = '';
        } catch (error) {
            console.error('Failed to hideSocialMenus', error);
        }
    }

    /**
     * Hides the sub-menus in the UI.
     * 
     * This method clears the inner HTML of the radial menu and removes its 'active' class.
     * 
     * @async
     * @function hideSubMenus
     * 
     * @throws {Error} Logs an error if hiding the sub-menus fails.
     * 
     * @memberof IChatUi
     */
    async hideSubMenus() {
        try {
            let radialMenu = document.getElementById('radial-menu');
            radialMenu.innerHTML = '';
            radialMenu.classList.remove('active');
        } catch (error) {
            console.error('Failed to hideSubMenus', error);
        }
    }

}

export default IChatUi;