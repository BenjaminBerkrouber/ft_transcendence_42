import IGame from './IGame.js';

class IGameUserData {
    constructor() {
        this.pongGames = [];
        this.connect4Games = [];
    }

    init(data) {
        if (data.length > 0 && data[0].pongGames) {
            for (let gameData of data[0].pongGames) {
                let game = new IGame();
                game.init(gameData);
                this.pongGames.push(game);
            }
        }
        if (data.length > 1 && data[1].connect4Games) {
            for (let gameData of data[1].connect4Games) {
                let game = new IGame();
                game.init(gameData);
                this.connect4Games.push(game);
            }
        }
    }

    getGamePerType(type) {
        return type ? this.getPongGames() : this.getConnect4Games();
    }

    getPongGames() {
        return this.pongGames;
    }

    getConnect4Games() {
        return this.connect4Games;
    }

    getNbrGamePerType(type) {
        return type ? this.getNbrPongGames() : this.getNbrConnect4Games();
    }

    getNbrPongGames() {
        if (!this.pongGames) return 0;
        return this.pongGames.length;
    }

    getNbrConnect4Games() {
        if (!this.connect4Games) return 0;
        return this.connect4Games.length;
    }

    getWinStreakPerType(type, playerId) {
        let games = type ? this.getPongGames() : this.getConnect4Games();
        let maxWinStreak = 0;
        let currentWinStreak = 0;
        for (let i = 0; i < games.length; i++) {
            if (games[i].getWinner().getId() === playerId) {
                currentWinStreak++;
                if (currentWinStreak > maxWinStreak)
                    maxWinStreak = currentWinStreak;
            } else
                currentWinStreak = 0;
        }
        return maxWinStreak;
    }

    getWinRatePerType(type, playerId) {
        try {
            let games = type ? this.getPongGames() : this.getConnect4Games();
            if (games.length === 0) return 0;
            let winCount = 0;
            for (let i = 0; i < games.length; i++) {
                if (games[i].getWinner().getId() === playerId)
                    winCount++;
            }
            return Math.round((winCount / games.length) * 100);
        } catch (e) {
            console.error(e);
            return 0;
        }
    }

    getAvgGameTimePerType(type) {
        try {
            let games = type ? this.getPongGames() : this.getConnect4Games();
            if (games.length === 0) return 0;
            let sum = 0;
            for (let i = 0; i < games.length; i++) {
                sum += games[i].getTimeMinutes() * 60 + games[i].getTimeSeconds();
            }
            let avg = sum / games.length;
            return `${Math.floor(avg / 60)}m ${Math.round(avg % 60)}s`;
        } catch (e) {
            console.error(e);
            return 0;
        }
    }

    getLastGamePerType(type) {
        let game = type ? this.getLastPongGame() : this.getLastConnect4Game();
        if (!game) return null;
        return game;
    }

    getLastPongGame() {
        if (this.pongGames.length === 0) return null;
        return this.pongGames[0];
    }

    getLastConnect4Game() {
        if (this.connect4Games.length === 0) return null;
        return this.connect4Games[0];
    }

    getMaxEloPlayerPerType(type, playerId) {
        try {
            let games = type ? this.getPongGames() : this.getConnect4Games();
            if (games.length === 0) return 0;
            let maxElo = 0;
            for (let i = 0; i < games.length; i++) {
                let elo = games[i].getEloByPlayerId(playerId);
                if (elo > maxElo)
                    maxElo = elo;
            }
            return maxElo;
        } catch (e) {
            console.error(e);
            return 0;
        }
    }

    getMinEloPlayerPerType(type, playerId) {
        try {
            let games = type ? this.getPongGames() : this.getConnect4Games();
            if (games.length === 0) return 0;
            let minElo = 0;
            for (let i = 0; i < games.length; i++) {
                let elo = games[i].getEloByPlayerId(playerId);
                if (elo < minElo)
                    minElo = elo;
            }
            return minElo;
        } catch (e) {
            console.error(e);
            return 0;
        }
    }

    printData() {
        console.info("Pong Games:");
        for (let i = 0; i < this.pongGames.length; i++) {
            this.pongGames[i].printData();
        }
        if (this.pongGames.length === 0) {
            console.info("No Pong Games");
        }
        console.info("Connect4 Games:");
        for (let i = 0; i < this.connect4Games.length; i++) {
            this.connect4Games[i].printData();
        }
        if (this.connect4Games.length === 0) {
            console.info("No Connect4 Games");
        }
    }
}

export default IGameUserData;