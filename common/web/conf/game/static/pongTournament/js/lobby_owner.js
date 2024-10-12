// var users;
// var lobbyUUID;
// var ws;

// async function innerCanvaIfLockLobby() {
//     try {
//         let element = document.getElementById('lobby-body');
//         let isLocked = await APIgetLobbyIsLocked(lobbyUUID);
//         isLocked = isLocked.locked;
//         if (isLocked) {
//             let NbrPlayer = document.getElementsByClassName('player-present').length;
//             tournamentorganized = await APIlockLobby(lobbyUUID);

//             tournamentINfo = await APIgetTournamentInfo(tournamentorganized.tournament.UUID);
//             console.log('======= OWNER ==== tournamentINfo', tournamentINfo);
//             deleteLobbyBody();
//             loadCanvaTournament(tournamentINfo, NbrPlayer);
//         }
//     } catch (error) {
//         console.error('Failed to innerCanvaIfLockLobby', error);
//     }
// }

// async function loadLobby() {
//     lobbyElement = document.getElementById('lobby_uuid');
//     lobbyUUID = lobbyElement.getAttribute('data-value');
//     users = await APIgetUserAvailableToLobby(lobbyUUID);
//     lobbyUUID = lobbyUUID.replace(/-/g, '');

//     await connectLobbySocket(lobbyUUID);

//     let isLocked = await APIgetLobbyIsLocked(lobbyUUID);
//     isLocked = isLocked.locked;
//     console.log('isLocked', isLocked);

//     if (isLocked == true) {
//         updateLockAtRedirect();
//         innerCanvaIfLockLobby();
//     } else {
//         toggleAddingPlayer();
//         handlersLockLobby();
//     }
// }

// // =============================== WS LOBBY NOTIF================================


// async function connectNotifSocker(userId) {
//     try {
//         let roomName = await APIgetHashRoom('notif_' + userId);
//         roomName = roomName.roomName;
//         // wsNotif = new WebSocket(`wss://${window.location.host}/ws/notif/${roomName}/`);
//         return;
//         wsNotif.onopen = function () {
//             console.log('wssNotif notif connected to ', roomName);
//         }

//         wsNotif.onerror = function (e) {
//             console.error('wssNotif notif error', e);
//         }

//         wsNotif.onclose = function (e) {
//             console.log('wssNotif notif closed');
//         }

//         wsNotif.onmessage = function (e) {
//             console.log('wssNotif notif message received');
//             let data = JSON.parse(e.data);
//             console.log(data);
//         }
//         return wsNotif;
//     } catch (error) {
//         console.error('Failed to connectNotifSocker', error);
//     }
// }


// async function sendWsNotifAtUser(userId) {
//     try {
//         let wsNotif = await connectNotifSocker(userId);
//         let lobbyUUID = document.getElementById('lobby_uuid').getAttribute('data-value');
//         wsNotif.onopen = () => {
//             wsNotif.send(JSON.stringify({
//                 'notifType': 'userNotReady',
//                 'ID_Game': 'null',
//                 'userDestination': userId,
//                 'UUID_Tournament': lobbyUUID,
//                 'link': '/game/pong/tournament/lobby/?lobby_id='+lobbyUUID,
//             }));
//             setTimeout(() => {
//                 wsNotif.close();
//             }, 10000);
//         };
//     } catch (error) {
//         console.error('Failed to sendWsNotifAtUser', error);
//     }
// }

// async function sendNotifAtUserNotReady() {
//     try {
//         let pendingUser = document.getElementsByClassName('pending-player');
//         for (let user of pendingUser) {
//             let idNumber = user.parentNode.parentNode.id.split("player-")[1];
//             sendWsNotifAtUser(idNumber);
//             console.log(idNumber);
//         }
//     } catch (error) {
//         console.error('Failed to sendNotifAtUserNotReady', error);
//     }
// }

// // =============================== MENU utils ================================



// // =============================== Lobby handlers ================================



// function handlersLockLobby() {
//     try {
//         console.log('handlersLockLobby');
//         let lockLobby = document.getElementById('lock-lobby');
//         lockLobby.addEventListener('click', async function handleClickLock() {
//             let NbrPlayer = document.getElementsByClassName('player-present').length;
//             if (NbrPlayer < 4 || (NbrPlayer & (NbrPlayer - 1)) !== 0) {
//                 console.log('You need to add more players');
//                 return;
//             }            
//             let NbrPlayerReady = document.getElementsByClassName('waiting-player').length;
//             if (NbrPlayerReady != NbrPlayer) {
//                 sendNotifAtUserNotReady();
//                 console.log('You need to wait for all player to be ready');
//                 return;
//             }
//             tournamentorganized = await APIlockLobby(lobbyUUID);
//             sendToWsLobby('lock', tournamentorganized.tournament.UUID);
//             updateLockAtRedirect();
//         });
//     } catch (error) {
//         console.error('Failed to handlersLockLobby', error);
//     }
// }

// // =============================== Looby toggle ================================


// // =============================== UPDATE ================================


// async function updateLockAtRedirect() {
//     try {
//         let lockLobby = document.getElementById('lock-lobby');
//         let parrentBox = lockLobby.parentNode;
//         lockLobby.remove();
//         let redirect = document.createElement('button');
//         redirect.className = 'lock-lobby';
//         redirect.innerHTML = 'Redirect';
//         parrentBox.appendChild(redirect);
//         redirect.addEventListener('click', async function () {
//             let nbrPlayer = document.getElementsByClassName('player-present').length;
//             let nbrPlayerReady = document.getElementsByClassName('waiting-player').length;
//             if (nbrPlayer != nbrPlayerReady) {
//                 sendNotifAtUserNotReady();
//                 console.log('You need to wait for all player to be ready');
//                 return;
//             }

//             sendToWsLobby('redirect', `/game/pong/tournament/game/?lobby_id=${lobbyUUID}`);
//             await APIfinishGameOnlyIa(lobbyUUID);
//         });
//     } catch (error) {
//         console.error('Failed to updateLockAtRedirect', error);
//     }
// }

// loadLobby();