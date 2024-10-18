import IPlayerData from '../../../class/IPlayerData.js';

class IGameTournament {
    constructor() {
        this.id = null;
        this.uuidTournament = null;
        this.humanPlayers = [];
        this.aiPlayers = [];
        this.winner = null;
        this.created_at = null;
        this.nextGame = null;
        this.layer = null;
        this.customGame = null;
    }

    init(data) {
        try {
            this.id = data.id;
            this.uuidTournament = data.uuid_tournament;
            for (let humanData of Object.values(data.players)) {
                let playerInfo = {
                    id: humanData.id,
                    username: humanData.username,
                    eloPong: humanData.eloPong,
                    eloConnect4: humanData.eloConnect4,
                    is_online: humanData.is_online,
                    last_connection: humanData.last_connection,
                    friends_count: humanData.friends_count,
                    is42User: humanData.is42User,
                    visitedProfile: humanData.visitedProfile,
                    elo_before: humanData.elo_before,
                    elo_after: humanData.elo_after,
                    img: humanData.img,
                    created_at: humanData.created_at,
                    mail: humanData.mail,
                };
                const player = new IPlayerData();
                player.init(playerInfo);
                this.humanPlayers.push(player);
            }
            for (let aiData of data.ia_players) {
                let data = {
                    id: aiData.id,
                    img: aiData.img,
                };
                this.aiPlayers.push(data);
            }
            this.winner = data.winner;
            this.created_at = data.created_at;
            this.nextGame = data.next_game;
            this.layer = data.layer;
            this.customGame = data.custom_game;
        } catch (error) {
            console.error('Failed to init', error);
        }
    }

    getLayer() {
        return this.layer;
    }

    getNbrPlayers() {
        return this.humanPlayers.length + this.aiPlayers.length
    }

    printData() {
        console.table(this);
    }
    
}

export default IGameTournament;