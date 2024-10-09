class ILobby {
    constructor() {
        this.lobbyUUID = null;
        this.lobbyName = null;
        this.owner_id = null;
        this.Humanplayers = [];
        this.aiPlayers = [];
        this.isLocked = false;
        this.createAt = null;
    }

    init() {
        
    }

}

export default ILobby;