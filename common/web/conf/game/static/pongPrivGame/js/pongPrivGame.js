import pongPrivGameUi from "./class/PongPrivGameUi.js";

document.addEventListener('DOMContentLoaded', async function () {
	let gameUUID = document.getElementById('gameUUID').getAttribute('data-gameUUID');
	let userData = await APIgetCurrentUser();
	let gameData = await APIgetGameData(gameUUID);

	let pongUi = new pongPrivGameUi();
	pongUi.init(userData, gameData.data);
	// pongUi.innerUserData();
	// pongUi.gameData.printData();
});

// import { startGame, movePaddles, moveSphere } from '../../pong3D/js/remote/pong3D.js';
// import { Game } from '../../pong3D/js/remote/class/games.js';


//    toggleCustomGame();



// // ===============================================================
// // ========================= WS Actions =========================
// // ===============================================================



// async function leave(data) {
// 	try {
// 		console.log('[WS-G]=>(' + data.message + ')');
// 		if (!gameStart) {
// 			setUserToLogout();
// 		} else {
// 			console.log('You win');
// 		}
// 	} catch (error) {
// 		console.error(error);
// 	}
// }

// // ######### FOR Game #########

// async function start(data) {
// 	try {
// 		console.log('[WS-G]=>(' + data.message + ')');
// 		console.log("starting bg");
// 		// game.setRender();
// 	} catch (error) {
// 		console.error(error);
// 	}
// }

// async function end(data) {
// 	try {
// 		console.log('[WS-G]=>(' + data.message + ')');
// 	} catch (error) {
// 		console.error(error);
// 	}
// }

// // ######### FOR GAMEPLAY #########

// async function move(data) {
// 	try {
// 		console.log('[WS-G]=>(' + data.message + ')');
// 		movePaddles(game, data.message.split(' | ')[0], data.message.split(' | ')[1]);
// 	} catch (error) {
// 		console.error(error);
// 	}
// }

// async function moveBall(data) {
// 	try {
// 		var data = JSON.parse(data.message);
// 		if (data.start == true)
// 			game.setRender();
// 		game.ball.acceleration.x = parseFloat(data.x);
// 		game.ball.acceleration.y = parseFloat(data.y);
// 		console.log("collision", new Date().getTime(), game.ball.group.position.x, game.ball.group.position.y);
// 		// moveSphere(game, parseFloat(data.message));
// 	} catch (error) {
// 		console.error(error);
// 	}
// }

// async function info(data) {
// 	try {
// 		console.log('[WS-G]=>(' + data.message + ')');
// 	} catch (error) {
// 		console.error(error);
// 	}
// }


// // ================== TOGGLE MODAL ================== //

// async function toggleCustomGame() {
// 	try {
// 		let customGame = document.getElementById('curstom-game');

// 		customGame.addEventListener('click', function () {
// 			console.log('click custom game');
// 		});
// 	} catch (error) {
// 		console.error(error);
// 	}
// }


