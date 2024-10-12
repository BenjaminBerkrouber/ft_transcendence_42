
// // =================== Lobby part ===================

// async function deleteLobbyBody() {
//     try {
//         let lobbyBody = document.getElementById('slop-content');
//         lobbyBody.innerHTML = '';
//         let loader = document.getElementById('loader-container');
//         loader.style.display = 'block';
//     } catch (error) {
//         console.error('Failed to deleteLobbyBody', error);
//     }

// }


// async function loadCanvaTournament(tournamentINfo, NbrPlayer) {
//     try {
//         await innerCanvaTournament();
//         let ctx = await initCanvas();
//         await drawTournament(ctx, tournamentINfo.gameTournament, NbrPlayer);
        
//         let loader = document.getElementById('loader-container');
//         loader.style.display = 'none';
        
//         await displayCanvaTournament();
//         console.log('tournament is draw');
//     } catch (error) {
//         console.error('Failed to innerCanvaTournament', error);
//     }
// }

// async function innerCanvaTournament() {
//     try {
//         let element = document.getElementById('lobby-body');
//         element.innerHTML = `
//             <div id="tournamentConainterOrga" style="display: none;">
//             <canvas width="1000" height="600" style="background-color: black;" id="tournamentOrganized"></canvas>
//             </div>
//         `;
//     } catch (error) {
//         console.error('Failed to innerCanvaTournament', error);
//     }
// }

// async function displayCanvaTournament() {
//     try {
//         let tournamentBoxOrga = document.getElementById('tournamentConainterOrga');
//         tournamentBoxOrga.style.display = 'block';
//     } catch (error) {
//         console.error('Failed to displayCanvaTournament', error);
//     }
// }


// // =================== Cava part ===================

// async function initCanvas() {
//     try {
//         const canvas = document.getElementById('tournamentOrganized');
//         const ctx = canvas.getContext('2d');
//         return ctx;
//     } catch (error) {
//         console.error('Failed to initCanvas', error);
//     }
// }

// async function getProduitFacteurPremier(nbr) {
//     try {
//         let facteurs = [];
//         let i = 2;
//         while (nbr > 1) {
//             if (nbr % i == 0) {
//                 facteurs.push(i);
//                 nbr = nbr / i;
//             } else {
//                 i++;
//             }
//         }
//         return facteurs;
//     } catch (error) {
//         console.error('Failed to getProduitFacteurPremier', error);
//     }
// }

// function getNbrPartyByTour(nbrParticipants, tour, DFP) {
//     if (DFP.length === 0) {
//         return 0;
//     }

//     let nbrGame = 0;
//     let indexDFP = DFP.length - 1;
//     let i = 0;
//     while (indexDFP >= 0 && i < tour) {
//         nbrGame = nbrParticipants / DFP[indexDFP];
//         nbrParticipants = nbrParticipants / DFP[indexDFP];
//         indexDFP -= 1;
//         i++;
//     }
//     return Math.floor(nbrGame);
// }

// function getNbrPlayerForGamePerTour(nbrParticipants, tour, DFP) {
//     if (DFP.length === 0) {
//         return 0;
//     }

//     let nbrGame = 0;
//     let indexDFP = DFP.length - 1;
//     let i = 0;
//     let nbrPlayerForGamePerTour = 0;
//     while (indexDFP >= 0 && i < tour) {
//         nbrGame = nbrParticipants / DFP[indexDFP];
//         nbrPlayerForGamePerTour = nbrParticipants / nbrGame;
//         nbrParticipants = nbrParticipants / DFP[indexDFP];
//         indexDFP -= 1;
//         i++;
//     }

//     return Math.floor(nbrPlayerForGamePerTour);
// }

// function getNbrGame(nbrParticipants, DFP) {
//     if (DFP.length === 0) {
//         return 0;
//     }
//     let nbrGame = 0;
//     let indexDFP = DFP.length - 1;
//     while (indexDFP >= 0) {
//         nbrGame += nbrParticipants / DFP[indexDFP];
//         nbrParticipants = nbrParticipants / DFP[indexDFP];
//         indexDFP -= 1;
//     }
//     return Math.floor(nbrGame);
// }

// async function drawTournament(ctx, gameTournament, NbrPlayer) {
//     let canvasWidth = ctx.canvas.width;
//     let canvasHeight = ctx.canvas.height;

//     console.log('===========DRAW TOURNAMENT===========');
//     console.log('NbrPlayer', NbrPlayer);
//     console.log('gameTournament', gameTournament);

//     let factor = await getProduitFacteurPremier(NbrPlayer);
//     let gamesTab = gameTournament;
//     let nbrRound = factor.length;
//     let currentCanvasWidth = canvasWidth;
//     let currentCanvasHeight = canvasHeight;
//     let currentStartX = 0;
//     let currentStartY = 0;   
//     let splitWidth = 2 * factor.length - 1;    
//     let splitHeight;

    
//     for (let i = 0; i < nbrRound; i++) {
//         let nbrGameForTour = getNbrPartyByTour(NbrPlayer, i + 1, factor);
//         let nbrGameLeft = 0;
//         let nbrGameRight = 0;
//         let jumpHeightX = 0;
//         let jumpHeightY = 0;

//         splitHeight = (factor.slice(0, -1).reduce((a, b) => a * b, 1)) / 2;
//         splitHeight = (factor.slice(0, -(i + 1)).reduce((a, b) => a * b, 1)) / 2;
//         splitHeight = splitHeight < 1 ? 1 : splitHeight;
//         for (let j = 0; j < nbrGameForTour; j++) {
//             let xstart;
//             let game = gamesTab.shift();
//             nbrPlayerPerGame = getNbrPlayerForGamePerTour(NbrPlayer, i + 1, factor);
//             ystep = (currentCanvasHeight / splitHeight) / nbrPlayerPerGame;
//             if (j % 2 == 0) {
//                 xstart = currentStartX + (canvasWidth / splitWidth / 2);
//                 nbrGameLeft++;
//             } else {
//                 xstart = currentCanvasWidth - (canvasWidth / splitWidth / 2);
//                 nbrGameRight++;
//             }
//             if (j % 2 == 0) {
//                 drawGame(ctx, i, nbrRound, game, xstart, ystep, jumpHeightX, nbrPlayerPerGame, 1, canvasWidth, splitWidth);
//                 jumpHeightX = currentCanvasHeight / splitHeight * nbrGameLeft;
//             } else {
//                 drawGame(ctx, i, nbrRound, game, xstart, ystep, jumpHeightY, nbrPlayerPerGame, 0, canvasWidth, splitWidth);
//                 jumpHeightY = currentCanvasHeight / splitHeight * nbrGameRight;
//             }
//         }
//         currentStartX += (canvasWidth / splitWidth);
//         currentStartY += (canvasHeight / splitHeight);
//         currentCanvasWidth -= (canvasWidth / splitWidth);
//     }
// } 

// async function drawGame(ctx, roundNum, nbrRound, game, currentStartX, ystep, jumpHeight, nbrParticipants, directionArrow, canvasWidth, splitWidth) {
//     try {
//         console.log('   g[id] => ', game.id+ ' | g[layer] =>' + game.layer + ' | g[next_game] =>' + game.next_game);
//         // console.log('   game[player] => ', game.players);
//         // console.log('   game[winner_player] => ', game.winner_player);
//         // console.log('   game[winner_ai] => ', game.winner_ai);
        
//         let firstPoints = jumpHeight + (ystep / 2);
//         let lastPoints = firstPoints;
//         let winnerType;

//         if (game.winner_player != null)
//             winnerType = 'player';
//         else if (game.winner_ai != null)
//             winnerType = 'ai';
//         else
//             winnerType = 'none';


//         for (let i = 0; i < nbrParticipants; i++) {
//             let yplayer = jumpHeight + (ystep / 2) + ystep * i;
//             let len = canvasWidth / splitWidth / 2;
//             let playerImg = 'https://png.pngtree.com/png-clipart/20191121/original/pngtree-sign-waiting-download-on-internet-icon-flat-style-png-image_5153330.jpg'
//             if (game.players.length > 0) {
//                 playerImg = game.players[i].img;
//                 playerImg = playerImg.startsWith('profile_pics') ? '/media/' + playerImg : playerImg;
//             }
//             lastPoints = yplayer;
            

//             drawConnexionGame(ctx, currentStartX, yplayer, len ,directionArrow, roundNum, nbrRound, i % 2 == 0);
//             if (winnerType != 'none') {
//                 if (winnerType == 'player' && game.winner_player == game.players[i].id) {
//                     drawCircle(ctx, currentStartX, yplayer, 30, 'green');
//                 } else if (winnerType == 'ai' && game.winner_ai == game.players[i].id) {
//                     drawCircle(ctx, currentStartX, yplayer, 30, 'green');
//                 } else {
//                     drawCircle(ctx, currentStartX, yplayer, 30, 'red');
//                 }
//             }
//             drawPlayer(ctx, playerImg, currentStartX, yplayer);
//         }
//         if (roundNum == nbrRound - 1) {
//             drawLine(ctx, currentStartX, firstPoints, currentStartX, lastPoints);
//         } else {
//             if (directionArrow) {
//                 drawLine(ctx, currentStartX + canvasWidth / splitWidth / 2, firstPoints, currentStartX + canvasWidth / splitWidth / 2, lastPoints);
//             } else {
//                 drawLine(ctx, currentStartX - canvasWidth / splitWidth / 2, firstPoints, currentStartX - canvasWidth / splitWidth / 2, lastPoints);
//             }
//         }
//     } catch (error) {
//         console.error('Failed to drawGame', error);
//     }
// }

// async function drawLine(ctx, x, y, x2, y2) {
//     try {
//         ctx.beginPath();
//         ctx.moveTo(x, y);
//         ctx.lineTo(x2, y2);
//         ctx.strokeStyle = 'white';
//         ctx.stroke();
//     } catch (error) {
//         console.error('Failed to drawLine', error);
//     }
// }

// async function drawConnexionGame(ctx, x, y, len, directionArrow, roundNum, nbrRound, isLeft) {
//     try {
//         ctx.beginPath();
//         ctx.strokeStyle = 'white';

//         if (roundNum !== 0 && roundNum !== nbrRound - 1) {
//             ctx.moveTo(x - len, y);
//             ctx.lineTo(x + len, y);
//         } else if (roundNum === 0) {
//             if (directionArrow) {
//                 ctx.moveTo(x, y);
//                 ctx.lineTo(x + len, y);
//             } else {
//                 ctx.moveTo(x, y);
//                 ctx.lineTo(x - len, y);
//             }
//         } else {
//             if (isLeft) {
//                 ctx.moveTo(x, y);
//                 ctx.lineTo(x - len, y);
//             } else {
//                 ctx.moveTo(x, y);
//                 ctx.lineTo(x + len, y);
//             }
//         }

//         ctx.stroke();
//     } catch (error) {
//         console.error('Failed to drawConnexionGame', error);
//     }
// }

// async function drawCircle(ctx, x, y, radius, color) {
//     try {
//         ctx.beginPath();
//         ctx.arc(x, y, radius, 0, Math.PI * 2);
//         ctx.fillStyle = color;
//         ctx.shadowColor = color;
//         ctx.shadowBlur = 10; // Ajustez cette valeur pour plus ou moins de flou
//         ctx.fill();
//         ctx.shadowBlur = 0; // Réinitialiser l'effet de flou pour les dessins suivants
//     } catch (error) {
//         console.error('Failed to drawCircle', error);
//     }
// }

// async function drawPlayer(ctx, playerImageUrl, x, y) {
//     try {
//         const width = 60;
//         const height = 60;
//         const radius = Math.min(width, height) / 2;
//         const img = new Image();
//         img.onload = function() {
//             ctx.save();
//             ctx.beginPath();
//             ctx.arc(x, y, radius, 0, Math.PI * 2, true);
//             ctx.closePath();
//             ctx.clip();
//             ctx.drawImage(img, x - width / 2, y - height / 2, width, height);
//             ctx.restore();
//         };
//         img.src = playerImageUrl;
//     } catch (error) {
//         console.error('Failed to drawPlayer', error);
//     }
// }
