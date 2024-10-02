/**
 * IWs class.
 * 
 * This class provides an interface for managing WebSocket connections for a specific room and socket.
 * It allows sending messages, receiving messages, and handling WebSocket events.
 * 
 * @class IWs
 * 
 * @property {WebSocket} ws - The WebSocket instance, initially set to null. It will be assigned when the connection is established.
 * @property {string} roomName - The name of the room for the WebSocket connection, used in the WebSocket URL.
 * @property {string} socketName - The type or identifier for the WebSocket, used in the URL.
 * @property {function} processWebSocketMessage - The handler for incoming WebSocket messages.
 * 
 * @memberof IWs
*/
class IWs {

    // ===============================================================================================
	// =========================================== Constructor =======================================
	// ===============================================================================================


    /**
     * WebSocket class constructor.
     * 
     * This constructor initializes a WebSocket connection for a specific room and socket.
     * It also allows handling incoming WebSocket messages by providing a custom callback function.
     * 
     * @param {string} roomName - The name of the room for which the WebSocket connection is established.
     * @param {string} socketName - The identifier for the WebSocket socket, used to define the WebSocket URL.
     * @param {function} processWebSocketMessage - Callback function to handle incoming WebSocket messages. 
     *                                             This function is executed each time a message is received.
     * 
     * @property {WebSocket} ws - The WebSocket instance, initially set to null. It will be assigned when the connection is established.
     * @property {string} roomName - The name of the room for the WebSocket connection, used in the WebSocket URL.
     * @property {string} socketName - The type or identifier for the WebSocket, used in the URL.
     * @property {function} processWebSocketMessage - The handler for incoming WebSocket messages.
	 * 
	 * @memberof IWs
     */
    constructor(roomName, socketName, processWebSocketMessage) {
        this.ws = null;
        this.roomName = roomName;
        this.socketName = socketName;
        this.processWebSocketMessage = processWebSocketMessage;
    }


	// ===============================================================================================
	// ============================================= INIT ============================================
	// ===============================================================================================


    /**
     * Initializes the WebSocket connection and sets up handlers.
     * 
     * This method attempts to establish a WebSocket connection by calling the `connectWebSocket` method.
     * Once the connection is initialized, it sets up the WebSocket event handlers using `setupWebSocketHandlers`.
     * If the initialization fails, an error is logged in the console.
     * 
     * @async
     * @function init
     * 
     * @throws {Error} Logs an error if the WebSocket connection or setup process fails.
	 * 
	 * @memberof IWs
     */
    async init() {
        try {
            this.ws = this.connectWebSocket();
            this.setupWebSocketHandlers();
        } catch (error) {
            console.error('Failed to init', error);
        }
    }


	// ===============================================================================================
	// =========================================== WS Gestion ========================================
	// ===============================================================================================


    /**
     * Establishes a WebSocket connection to the server.
     * 
     * Creates a new WebSocket instance using the provided `socketName` and `roomName`.
     * The WebSocket URL is generated dynamically based on the current host.
     * If the connection fails, an error is logged.
     * 
     * @function connectWebSocket
     * @returns {WebSocket} The created WebSocket instance.
     * @throws {Error} Logs an error if the WebSocket connection fails.
	 * 
	 * @memberof IWs
     */
    connectWebSocket() {
        try {
            return new WebSocket(`wss://${window.location.host}/ws/${this.socketName}/${this.roomName}/`);        
        } catch (error) {
            console.error('Failed to connectWebSocket', error);
        }
    }

    /**
     * Sends a message through the WebSocket connection.
     * 
     * The message is serialized to JSON before being sent to the server.
     * If the WebSocket connection is not open or fails to send the message, an error is logged.
     * 
     * @async
     * @function sendToWebSocket
     * @param {Object} message - The message object to be sent through the WebSocket.
     * @throws {Error} Logs an error if the WebSocket fails to send the message.
	 * 
	 * @memberof IWs
     */
    async sendToWebSocket(message) {
        try {
            this.ws.send(JSON.stringify(message));
        } catch (error) {
            console.error('Failed to sendToWebSocket', error);
        }
    }

    /**
     * Closes the WebSocket connection.
     * 
     * Attempts to close the current WebSocket connection gracefully.
     * If an error occurs during the closing process, it is logged.
     * 
     * @async
     * @function closeWebSocket
     * @throws {Error} Logs an error if the WebSocket fails to close.
	 * 
	 * @memberof IWs
     */
    async closeWebSocket() {
        try {
            this.ws.close();
        } catch (error) {
            console.error('Failed to closeWebSocket', error);
        }
    }


    // ===============================================================================================
	// ========================================== Handlers ===========================================
	// ===============================================================================================


    /**
     * Sets up WebSocket event handlers.
     * 
     * This method assigns the appropriate event handler functions for WebSocket events such as `onopen`, 
     * `onmessage`, `onclose`, and `onerror`. These functions are responsible for managing the WebSocket's
     * lifecycle and processing incoming data.
     * 
     * @function setupWebSocketHandlers
	 * 
	 * @memberof IWs
     */
    setupWebSocketHandlers() {
        this.ws.onopen = this.handleWebSocketOpen;
        this.ws.onmessage = this.handleWebSocketMessage;
        this.ws.onclose = this.handleWebSocketClose;
        this.ws.onerror = this.handleWebSocketError;
    }

    /**
     * Handles the WebSocket connection opening event.
     * 
     * This function is triggered when the WebSocket connection is successfully established.
     * It logs the connection status and the associated room name to the console.
     * 
     * @function handleWebSocketOpen
	 * 
	 * @memberof IWs
     */
    handleWebSocketOpen = () => {
        console.log('[WebSocket] => connection opened', this.roomName);
    }
    

    /**
     * Handles incoming WebSocket messages.
     * 
     * This function is triggered when a message is received from the WebSocket server. The message is
     * expected to be in JSON format. The function parses the message and, if a `processWebSocketMessage` 
     * callback function is provided, it invokes the callback with the parsed data.
     * 
     * @function handleWebSocketMessage
     * @param {MessageEvent} event - The event object that contains the data sent by the WebSocket server.
	 * 
	 * @memberof IWs
     */
    handleWebSocketMessage = (event) => {
        try {
            let data = JSON.parse(event.data);
            if (this.processWebSocketMessage && typeof this.processWebSocketMessage === 'function')
                this.processWebSocketMessage(data);
        } catch (error) {
            console.error('Failed to handleWebSocketMessage', error);
        }
    }
    
    /**
     * Handles WebSocket connection closure.
     * 
     * This function is triggered when the WebSocket connection is closed, either by the client or server.
     * It logs the event details, such as the reason for closure and connection status, to the console.
     * 
     * @function handleWebSocketClose
     * @param {CloseEvent} event - The event object containing details about the WebSocket connection closure.
	 * 
	 * @memberof IWs
     */
    handleWebSocketClose = (event) => {
        console.log('[WebSocket] => connection closed:', event);
    }
    
    /**
     * Handles WebSocket errors.
     * 
     * This function is triggered when an error occurs with the WebSocket connection or during data transmission.
     * It logs the error details to the console for debugging purposes.
     * 
     * @function handleWebSocketError
     * @param {Event} error - The error event object that contains details about the WebSocket error.
	 * 
	 * @memberof IWs
     */
    handleWebSocketError = (error) => {
        console.error('[WebSocket] => error:', error);
    }

}

export default IWs;