import IDataUserManager from "../../../class/IDataUserManager.js";
import * as API from "../../../class/API.js";

class UiProgress extends IDataUserManager {
    constructor() {
        super();

        this.elementsToUpdate = null
        this.gameHistoryType = true;

        this.winRateCanvaElement = null;
        this.ctxWinRate = null;
        this.burgerFillColor = '#2c2538';
        this.burgerBackgroundColor = '#5d547c';

        this.progressCanvaElement = null;
        this.ctxProgress = null;
        this.progressCanvaConfig = {
            backgroundColor: '#191723',
            gridColor: 'white',
            lineWidth: 1,
            usingWidth: 200,
            usingHeight: 100,
            font: '12px Arial',
            textAlign: 'center',
            pointColor: '#ffffff',
            pointRadius: 3,
        };
    }

    async init(userData, gameData) {
        await super.init(userData, gameData);

        this.elementsToUpdate = {
            "profile-avatar": {
                staticValue: '',
                func: () => this.PlayerData.getImg(),
                type: 'src'
            },
            "profile-username": {
                staticValue: '',
                func: () => this.PlayerData.getUsername(),
                type: 'innerHTML'
            },
            "last-connexion": {
                staticValue: '',
                func: () => this.PlayerData.getLastConnection(),
                type: 'innerHTML'
            },
            "last-game-is-win": {
                staticValue: '',
                func: () => this.GameUserData.getLastGamePerType(this.gameHistoryType).getWinOrLose(this.PlayerData),
                type: 'innerHTML'
            },
            "games-count": {
                staticValue: '',
                func: () => this.GameUserData.getNbrGamePerType(this.gameHistoryType),
                type: 'innerHTML'
            },
            "max-win-streak": {
                staticValue: '<i class="fas fa-trophy"></i> ',
                func: () => this.GameUserData.getWinStreakPerType(this.gameHistoryType, this.PlayerData.getId()),
                type: 'innerHTML'
            },
            "avg-game-time": {
                staticValue: '',
                func: () => this.GameUserData.getAvgGameTimePerType(this.gameHistoryType),
                type: 'innerHTML'
            },
            "current-elo": {
                staticValue: '',
                func: () => this.PlayerData.getEloPerType(this.gameHistoryType),
                type: 'innerHTML'
            },
            "max-elo": {
                staticValue: '',
                func: () => this.GameUserData.getMaxEloPlayerPerType(this.gameHistoryType, this.PlayerData.getId()),
                type: 'innerHTML'
            },
        };
        this.winRateCanvaElement = document.getElementById('progress-burger');
        this.ctxWinRate = this.winRateCanvaElement.getContext('2d');
        this.progressCanvaElement = document.getElementById('progress-chart');
        this.ctxProgress = this.progressCanvaElement.getContext('2d');
    }

    async innerProgressData() {
        try {
            for (const [id, { staticValue, func, type }] of Object.entries(this.elementsToUpdate)) {
                const element = document.getElementById(id);
                if (!element) continue;
                const dynamicValue = func();
                if (type === 'src') {
                    element.src = dynamicValue;
                } else if (type === 'innerHTML') {
                    element.innerHTML = staticValue + dynamicValue;
                }
            }
        } catch (error) {
            console.error("An error occurred in innerProgressData", error);
        }
    }

    innerGames() {
        const gameHistoryBox = document.getElementById('match-history-container');
        if (!gameHistoryBox) return;
        const games = this.gameHistoryType ? this.GameUserData.getPongGames() : this.GameUserData.getConnect4Games();

        games.forEach(game => {
            const newGame = document.createElement('div');
            newGame.classList.add('match');
            const userBox = this.createUserBox(game);
            const timeBox = this.createTimeBox(game);
            const winnerBox = this.createWinnerBox(game);
            const eloBox = this.createEloBox(game);
            this.appendGameElements(newGame, userBox, timeBox, winnerBox, eloBox);
            gameHistoryBox.appendChild(newGame);
        });
    }

    createUserBox(game) {
        const userBox = document.createElement('div');
        userBox.classList.add('player-info', 'img-box-match');
        for (const player of game.getPlayers()) {
            const newImg = document.createElement('img');
            newImg.src = player.getImg();
            newImg.alt = player.getUsername();
            newImg.classList.add('img-match', player.getUsername() === game.getWinner().getUsername() ? 'online' : 'offline');
            userBox.appendChild(newImg);
        }
        return userBox;
    }

    createTimeBox(game) {
        const timeBox = document.createElement('div');
        timeBox.classList.add('match-info');
        timeBox.innerHTML = `${game.getTimeMinutes()}m ${game.getTimeSeconds()}s`;
        return timeBox;
    }

    createWinnerBox(game) {
        const winnerBox = document.createElement('div');
        winnerBox.classList.add('match-winner');
        winnerBox.innerHTML = game.getWinner().getUsername();
        return winnerBox;
    }

    createEloBox(game) {
        const eloBox = document.createElement('div');
        eloBox.classList.add('match-elo');
        const eloValue = game.getEloByPlayerId(this.PlayerData.getId());
        eloBox.innerHTML = `
            <span style="color: ${eloValue > 0 ? 'green' : 'red'};">${eloValue > 0 ? '+' : '-'} ${Math.abs(eloValue)}</span>
        `;
        return eloBox;
    }

    appendGameElements(newGame, userBox, timeBox, winnerBox, eloBox) {
        newGame.appendChild(userBox);
        newGame.appendChild(timeBox);
        newGame.appendChild(winnerBox);
        newGame.appendChild(eloBox);
    }

    async innerGameStats() {
        try {
            let bool = this.gameHistoryType ? this.GameUserData.getNbrPongGames() > 0 : this.GameUserData.getNbrConnect4Games() > 0;
            let funcInnerGame = bool ? this.innerGames : null;
            if (funcInnerGame) funcInnerGame.call(this);
        } catch (error) {
            console.error("An error occured in innerGameStats", error);
        }
    }

    async drawBurger() {
        try {
            let winRate = this.GameUserData.getWinRatePerType(this.gameHistoryType, this.PlayerData.getId());
            
            if (winRate < 0 || winRate > 100 || isNaN(winRate)) {
                console.error("Invalid win rate percentage:", winRate);
                return;
            }
    
            this.clearBurgerChart();
            this.drawBurgerChart(winRate);
            this.drawBurgerChartText(winRate);
        } catch (error) {
            console.error("An error occurred while drawing the burger chart:", error);
        }
    }
    
    drawBurgerChart(percentage) {
        try {
            const { width, height } = this.winRateCanvaElement;
            if (!width || !height)
                throw new Error("Canvas dimensions are not valid.");    
            const radius = Math.min(width, height) * 0.5;
            const startAngle = 3 * Math.PI * 0.5;
            this.drawCircle(this.burgerBackgroundColor, width * 0.5, height * 0.5, radius, startAngle, startAngle + 2 * Math.PI);
            this.drawCircle(this.burgerFillColor, width * 0.5, height * 0.5, radius, startAngle, startAngle + (percentage / 100) * (2 * Math.PI));
        } catch (error) {
            console.error("An error occurred while drawing the burger chart:", error);
        }
    }

    drawCircle(color, centerX, centerY, radius, startAngle, endAngle) {
        try {
            this.ctxWinRate.fillStyle = color;
            this.ctxWinRate.beginPath();
            this.ctxWinRate.moveTo(centerX, centerY);
            this.ctxWinRate.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctxWinRate.closePath();
            this.ctxWinRate.fill();
        } catch (error) {
            console.error("An error occurred while drawing the circle:", error);
        }
    }
    
    drawBurgerChartText(percentage) {
        try {
            const winText = `Win ${percentage}%`;
            const loseText = `Lose ${100 - percentage}%`;
            this.ctxWinRate.fillStyle = 'white';
            this.ctxWinRate.textAlign = 'center';
            this.ctxWinRate.font = '15px Arial';
                this.ctxWinRate.fillText(winText, this.winRateCanvaElement.width * 0.70, this.winRateCanvaElement.height * 0.30);
            this.ctxWinRate.fillText(loseText, this.winRateCanvaElement.width * 0.30, this.winRateCanvaElement.height * 0.30);
        } catch (error) {
            console.error("An error occurred while drawing the burger chart text:", error);
        }
    }

    clearBurgerChart() {
        try {
            this.ctxWinRate.clearRect(0, 0, this.winRateCanvaElement.width, this.winRateCanvaElement.height);
        } catch (error) {
            console.error("An error occurred while clearing the burger chart:", error);
        }
    }

    drawProgressChart() {
        try {
            this.progressCanvaElement.width = this.progressCanvaElement.parentElement.clientWidth;
            this.progressCanvaElement.height = this.progressCanvaElement.parentElement.clientHeight;
            this.clearProgressChart();
            this.drawAxes();

            let games = this.GameUserData.getGamePerType(this.gameHistoryType);
            games = games.slice(0, 50);
            let maxElo, minElo;
            [minElo, maxElo] = this.getMaxEloForGame(games, this.PlayerData.getId());
            this.drawLegendElo(games.length, minElo, maxElo);
            this.drawLegendDate(games);
            this.drawData(games, maxElo, minElo);
        } catch (error) {
            console.error("An error occurred while drawing the progress chart:", error);
        }
    }

    getMaxEloForGame(games, playerId) {
        try {
            let maxElo = Number.MIN_SAFE_INTEGER;
            let minElo = Number.MAX_SAFE_INTEGER;
            for (let i = 0; i < games.length; i++) {
                let elo = games[i].getEloByPlayerId(playerId);
                if (elo > maxElo) maxElo = elo;
                if (elo < minElo) minElo = elo;
            }
            return [minElo, maxElo];
        } catch (error) {
            console.error("An error occurred while getting the max elo:", error);
        }
    }

    async drawAxes() {
        this.ctxProgress.fillStyle = this.progressCanvaConfig.backgroundColor;
        this.ctxProgress.fillRect(0, 0, this.progressCanvaElement.width, this.progressCanvaElement.height);
    
        this.ctxProgress.beginPath();
        this.ctxProgress.moveTo(30, 0);
        this.ctxProgress.lineTo(30, this.progressCanvaElement.height);
        this.ctxProgress.strokeStyle = this.progressCanvaConfig.gridColor;
        this.ctxProgress.lineWidth = this.progressCanvaConfig.lineWidth;
        this.ctxProgress.stroke();
    
        this.ctxProgress.beginPath();
        this.ctxProgress.moveTo(0, this.progressCanvaElement.height - 30);
        this.ctxProgress.lineTo(this.progressCanvaElement.width, this.progressCanvaElement.height - 30);
        this.ctxProgress.strokeStyle = this.progressCanvaConfig.gridColor;
        this.ctxProgress.lineWidth = this.progressCanvaConfig.lineWidth;
        this.ctxProgress.stroke();
    }

    async drawLegendElo(nbrGames, minElo, maxElo) {
        try {
            this.ctxProgress.fillStyle = this.progressCanvaConfig.gridColor;
            this.ctxProgress.textAlign = 'center';
            this.ctxProgress.font = '12px Arial';
        
            var eloRange = maxElo - minElo;
            var lineHeight = (this.progressCanvaElement.height) / nbrGames;
            for (var i = 0; i < nbrGames; i++) {
                var elo = Math.round(minElo + (i * eloRange / (nbrGames - 1)));
                var y = this.progressCanvaElement.height - 50 - i * lineHeight;
                this.ctxProgress.fillText(elo, 12, y);
            }
        } catch (error) {
            console.error("An error occurred while drawing the legend elo:", error);
        }
    }

    async drawLegendDate(dataGames) {
        try {
            this.ctxProgress.fillStyle = this.progressCanvaConfig.gridColor;
            this.ctxProgress.textAlign = 'center';
            this.ctxProgress.font = '10px Arial';
        
            var lineWidth = (this.progressCanvaElement.width - 30) / dataGames.length;
            for (var i = 0; i < dataGames.length; i++) {
                var x = 15 + (i + 0.5) * lineWidth;
                var y = this.progressCanvaElement.height - 15;
                this.ctxProgress.fillText(dataGames[i]['created_at'].split("T")[0], x, y);
            }
        } catch (error) {
            console.error("An error occurred while drawing the legend date:", error);
        }
    }

    async drawData(dataGames, maxElo, minElo) {
        try {
            this.ctxProgress.fillStyle = this.progressCanvaConfig.gridColor;
            this.ctxProgress.textAlign = 'center';
            this.ctxProgress.font = '10px Arial';
            
            var eloRange = maxElo - minElo;
            var lineWidth = (this.progressCanvaElement.width - 30) / dataGames.length;

            for (var i = dataGames.length - 1; i >= 0; i--) {
                var percentage = (dataGames[i].getEloByPlayerId(this.PlayerData.getId()) - minElo) / eloRange;
                percentage = Math.max(0, Math.min(1, percentage));
                var y = this.progressCanvaElement.height - 50 - (percentage * (this.progressCanvaElement.height - 50));
                var x = 15 + ((dataGames.length - 1 - i) + 0.5) * lineWidth;
                this.drawPoints(x, y);
                if (i - 1 < 0) continue;
                let nextX = 15 + ((dataGames.length - 1 - i + 1) + 0.5) * lineWidth;
                let nextY = this.progressCanvaElement.height - 50 - ((dataGames[i - 1].getEloByPlayerId(this.PlayerData.getId()) - minElo) / eloRange) * (this.progressCanvaElement.height - 50);
                this.drawLine(x, y, nextX, nextY);
            }
        } catch (error) {
            console.error("An error occurred while drawing the data:", error);
        }
    }
    
    async drawPoints(x, y) {
        try {
            this.ctxProgress.beginPath();
            this.ctxProgress.arc(x, y, this.progressCanvaConfig.pointRadius, 0, 2 * Math.PI);
            this.ctxProgress.fillStyle = this.progressCanvaConfig.pointColor;
            this.ctxProgress.fill();
        } catch (error) {
            console.error("An error occurred while drawing the points:", error);
        }
    }

    async drawLine(x, y, nextX, nextY) {
        try {
            this.ctxProgress.beginPath();
            this.ctxProgress.moveTo(x, y);
            this.ctxProgress.lineTo(nextX, nextY);
            this.ctxProgress.strokeStyle = this.progressCanvaConfig.pointColor;
            this.ctxProgress.lineWidth = this.progressCanvaConfig.lineWidth;
            this.ctxProgress.stroke();
        } catch (error) {
            console.error("An error occurred while drawing the line:", error);
        }
    }

    clearProgressChart() {
        try {
            this.ctxProgress.clearRect(0, 0, this.progressCanvaElement.width, this.progressCanvaElement.height);
        } catch (error) {
            console.error("An error occurred while clearing the progress chart:", error);
        }
    }
};
export default UiProgress;