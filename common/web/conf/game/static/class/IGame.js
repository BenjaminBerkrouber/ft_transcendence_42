import IPlayerData from './IPlayerData.js';

class IGame {
    constructor() {
        this.UUID = 0;
        this.type = null;
        this.finished = false;
        this.time = 0;
        this.winnerId = 0;
        this.players = [];
        this.created_at = null;
    }

    init(data) {
        this.UUID = data.uuidGame;
        this.type = data.type;
        this.players = data.players.map(playerData => {
            let data = {
                id: playerData.player.id,
                username: playerData.player.username,
                eloPong: playerData.eloPong,
                eloConnect4: playerData.eloConnect4,
                is_online: playerData.player.is_online,
                last_connection: playerData.player.last_connection,
                friends_count: playerData.player.friends_count,
                is42User: playerData.player.is42User,
                visitedProfile: playerData.player.visitedProfile,
                elo_before: playerData.elo_before,
                elo_after: playerData.elo_after,
                img: playerData.player.img,
                created_at: playerData.player.created_at,
                mail: playerData.player.mail,
            };
            const player = new IPlayerData();
            player.init(data);
            return player;
        });
        this.created_at = data.created_at;
    }

    getUUID() {
        return this.UUID;
    }

    getPlayers() {
        return this.players;
    }

    getPlayerById(id) {
        return this.players.find(player => player.getId() === id);
    }

    getEloByPlayerId(id) {
        return this.players.find(player => player.getId() === id).getEloAfterGame();
    }

    getNewEloByPlayerIdForGame(id) {
        return this.players.find(player => player.getId() === id).getEloAfterGameDiff();
    }

    getWinner() {
        return this.winner;
    }

    getTime() {
        return this.time;
    }


    getCreatedAt() {
        return this.created_at;
    }

    printData() {
        const tableData = {
            "UUID": this.UUID.toString().substring(0, 8),
            "Winner": this.winner.getUsername(),
            "Created at HHMMSS": this.created_at.split('T')[1].split('.')[0],
        };
        // this.players.forEach((player, index) => {
        //     tableData[`Player ${index + 1}`] = player.getUsername() + ' ' + (this.isWinner(player) ? 'Winner' : 'Loser');
        // });
    
        console.table([tableData]);
    }
    
}

export default IGame;