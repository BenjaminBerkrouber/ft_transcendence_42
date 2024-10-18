import IGameTournament from "./IGameTournament.js";

class UITournament {
    constructor() {
        this.userBracketctx = null;
        this.canvasWidth = 900;
        this.canvasHeight = 450;

        this.noPlayerImg = 'https://png.pngtree.com/png-clipart/20191121/original/pngtree-sign-waiting-download-on-internet-icon-flat-style-png-image_5153330.jpg'
        this.nbrLayer = 0;
        this.IGameTournament = [];
        this.ctxConf = [];
        this.dfp = [];
    }

    init(tournamentData) {
        try {
            this.dfp = this.getDfp(tournamentData.nbrPlayers);
            this.nbrLayer = tournamentData.nbrLayer;
            for (let gameData of tournamentData.games) {
                let game = new IGameTournament();
                game.init(gameData);
                // game.printData();
                this.IGameTournament.push(game);
            }
            this.innerUserBracketCanva();
            this.initUserBracketCanva();
            this.initctxConf();
        } catch (error) {
            console.error('Failed to init', error);
        }
    }

    initctxConf() {
        try {
            let stepWidth = this.canvasWidth / (this.nbrLayer * 2 - 1);
            for (let i = 1; i <= this.nbrLayer; i++) {
                let games = this.IGameTournament.filter(game => game.layer === i)
                let stepHeight = this.canvasHeight / (games.length / 2);
                let config = {
                    games: games,
                    nbrGame: games.length,
                    nbrPlayersByGame: this.dfp[this.dfp.length - i],
                    startWidth: stepWidth * (i - 1),
                    endWidth: this.canvasWidth - stepWidth * (i - 1),
                    stepWidth: stepWidth,
                    startHeightLeft: 0,
                    startHeightRight: 0,
                    stepHeight: stepHeight,
                };
                this.ctxConf.push(config);
            }
            console.log('ctxConf:', this.ctxConf);
        } catch (error) {
            console.error('Failed to initctxConf', error);
        }
    }



    async drawTournament() {
        try {
            for (let layer = 0; layer < this.nbrLayer; layer++)
                for (let gameNbr = 0; gameNbr < this.ctxConf[layer].nbrGame; gameNbr++)
                    this.drawGame(layer, gameNbr, this.ctxConf[layer].games[gameNbr]);
        } catch (error) {
            console.error('Failed to drawTournament', error);
        }
    }


    drawGame(layer, gameNbr, gameData) {
        try {
            let len = this.ctxConf[layer].stepWidth / 2
            let lastPoints = [];
            let currentX = (gameNbr % 2 ? this.ctxConf[layer].startWidth + len : this.ctxConf[layer].endWidth - len);
            let currentY = (gameNbr % 2 ? this.ctxConf[layer].startHeightLeft : this.ctxConf[layer].startHeightRight);
            for (let i = 0; i < this.ctxConf[layer].nbrPlayersByGame; i++) {
                let xPlayer = currentX;
                let yPlayer = currentY + this.ctxConf[layer].stepHeight / this.ctxConf[layer].nbrPlayersByGame * i + (this.ctxConf[layer].stepHeight / this.ctxConf[layer].nbrPlayersByGame) / 2;
                if (i == 0) lastPoints.x = yPlayer;
                let player = gameData.humanPlayers.length > 0 ? gameData.humanPlayers.pop(1) : gameData.aiPlayers.pop(1);
                this.drawConnectionGame(currentX, yPlayer, layer, gameNbr);
                if (gameData.winnerId && player)
                    this.drawCircle(xPlayer, yPlayer, gameData.winnerId == player.id ? 'green' : 'red');
                this.drawPlayer((player ? player.img : this.noPlayerImg), xPlayer, yPlayer);
                lastPoints.y = yPlayer;
            }
            gameNbr % 2 ? this.ctxConf[layer].startHeightLeft += this.ctxConf[layer].stepHeight : this.ctxConf[layer].startHeightRight += this.ctxConf[layer].stepHeight;
            if (layer == this.nbrLayer - 1) return lastPoints;
            let lineX = gameNbr % 2 ? this.ctxConf[layer].startWidth + this.ctxConf[layer].stepWidth : this.ctxConf[layer].endWidth - this.ctxConf[layer].stepWidth;
            this.drawLine( lineX, lastPoints.x, lineX, lastPoints.y);
        } catch (error) {
            console.error('Failed to drawGame', error);
        }
    }

    async drawPlayer(playerImageUrl, x, y) {
        try {
            const width = 60;
            const img = new Image();
            img.onload = () => {
                this.userBracketctx.save();
                this.userBracketctx.beginPath();
                this.userBracketctx.arc(x, y, width / 2, 0, Math.PI * 2, true);
                this.userBracketctx.closePath();
                this.userBracketctx.clip();
                this.userBracketctx.drawImage(img, x - width / 2, y - width / 2, width, width);
                this.userBracketctx.restore();
            };
            img.src = playerImageUrl;
        } catch (error) {
            console.error('Failed to drawPlayer', error);
        }
    }

    async drawConnectionGame(x, y, layer, gameNbr) {
        try {
            let len = this.ctxConf[layer].stepWidth / 2;
            if (layer == 0) return this.drawLine(x, y, gameNbr % 2 ? x + len : x - len, y);
            if (layer == this.nbrLayer - 1) return;
            this.drawLine(x - len, y, x + len, y);
        } catch (error) {
            console.error('Failed to drawConnectionGame', error);
        }
    }

    async drawLine(x, y, dx, dy) {
        try {
            this.userBracketctx.beginPath();
            this.userBracketctx.moveTo(x, y);
            this.userBracketctx.lineTo(dx, dy);
            this.userBracketctx.strokeStyle = 'white';
            this.userBracketctx.stroke();
        } catch (error) {
            console.error('Failed to drawLine', error);
        }
    }
    
    
    async drawCircle(x, y, color) {
        try {
            this.userBracketctx.beginPath();
            this.userBracketctx.arc(x, y, 32, 0, Math.PI * 2);
            this.userBracketctx.fillStyle = color;
            this.userBracketctx.fill();
            this.userBracketctx.shadowBlur = 0;
        } catch (error) {
            console.error('Failed to drawCircle', error);
        }
    }

    getDfp(nbrParticipants) {
        try {
            let DFP = [];
            let i = 2;
            while (i <= nbrParticipants) {
                if (nbrParticipants % i === 0) {
                    DFP.push(i);
                    nbrParticipants = nbrParticipants / i;
                } else
                    i++;
            }
            return DFP;
        } catch (error) {
            console.error('Failed to getdfp', error);
        }
    }


    async start() {
        try {
            this.removeLobbyBody();
            await this.drawTournament();
            this.removeLoader();
            this.displayCanvaTournament();
            console.log('tournament is draw');
        }
        catch (error) {
            console.error('Failed to start', error);
        }
    }

    async initUserBracketCanva() {
        try {
            let canvas = document.getElementById('tournamentOrganized');
            this.userBracketctx = canvas.getContext('2d');
        } catch (error) {
            console.error('Failed to initUserBracketCanva', error);
        }
    }

    async innerUserBracketCanva() {
        try {
            let element = document.getElementById('lobby-body');
            element.innerHTML = `
                <div id="tournamentConainterOrga" style="display: none;">
                    <canvas width="900" height="450" style="background-color: black;" id="tournamentOrganized"></canvas>
                </div>
            `;
        } catch (error) {
            console.error('Failed to innerUserBracketCanva', error);
        }
    }

    getNbrGameAtLayer(layer) {
        try {
            return this.IGameTournament.filter(game => game.layer === layer).length;
        } catch (error) {
            console.error('Failed to getNbrGameAtLayer', error);
        }
    }

    async displayCanvaTournament() {
        try {
            let tournamentBoxOrga = document.getElementById('tournamentConainterOrga');
            tournamentBoxOrga.style.display = 'block';
        } catch (error) {
            console.error('Failed to displayCanvaTournament', error);
        }
    }

    async removeLobbyBody() {
        try {
            let lobbyBody = document.getElementById('slop-content');
            if (!lobbyBody) return;
            lobbyBody.innerHTML = '';
            let loader = document.getElementById('loader-container');
            loader.style.display = 'block';
        } catch (error) {
            console.error('Failed to removeLobbyBody', error);
        }
    }

    async removeLoader() {
        try {
            let loader = document.getElementById('loader-container');
            loader.style.display = 'none';
        } catch (error) {
            console.error('Failed to removeLoader', error);
        }
    }

}

export default UITournament;