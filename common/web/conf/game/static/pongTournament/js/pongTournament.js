import UIpongTournament from "./class/UIpongTournament.js";

document.addEventListener('DOMContentLoaded', async function () {
    try {
        let userData = await APIgetCurrentUser();
        let lobbysData = await APIgetAllLobby(userData.id);
        let uiPongTournament = new UIpongTournament();
        uiPongTournament.init(userData, lobbysData);
    } catch (error) {
        console.error('Failed to getCurrentUser', error);
    }
});

// function pongTournament() {
//     let AllLobby = new Set();
//     let Allremove = new Set();

//     async function initPongTournament() {
//         let allLobby = await APIgetAllLobby(userId);
//         await innerAllLobby(allLobby.data);
//         handlersRemoveLobby();
//         handlersJoinLobby();
//         handlersNewLobby();
//     }


//     async function handlersNewLobby() {
//         let newTournamentBtn = document.getElementById('pongTournament-btn');
//         newTournamentBtn.addEventListener('click', async function () {
//             try {
//                 showNewLobbyForm();
//                 handlersSubmitLobbyForm();
//                 handlersCancelLobbyForm();
//             } catch (error) {
//                 console.error('Failed to createGame', error);
//             }
//         });
//     }

//     async function showNewLobbyForm() {
//         try {
//             let pongTournamentForm = document.getElementById('pongTournament-form');
//             pongTournamentForm.style.display = 'block';
//         } catch (error) {
//             console.error('Failed to showNewLobbyForm', error);
//         }
//     }

//     async function hideNewLobbyForm() {
//         try {
//             let pongTournamentForm = document.getElementById('pongTournament-form');
//             pongTournamentForm.style.display = 'none';
//         } catch (error) {
//             console.error('Failed to hideNewLobbyForm', error);
//         }
//     }

//     async function handerlsSubmit(event) {
//         event.preventDefault();
//         let lobbyName = document.getElementById('lobby-name').value;
//         let lobbyNameRegex = /^[a-zA-Z]{3,20}$/;
//         if (!lobbyNameRegex.test(lobbyName)) {
//             alert('Please enter a valid name for the lobby (3-20 letters only)');
//             return;
//         }
//         let newLobby = await APIcreateLobby(userId, lobbyName);
//         await innerNewLobby(newLobby.lobby, lobbyName);
//         handlersJoinLobby();
//         handlersRemoveLobby();
//         hideNewLobbyForm();
//         let submitBtn = document.getElementById('submit-lobby');
//         submitBtn.removeEventListener('click', handerlsSubmit);
//     }

//     async function handlersSubmitLobbyForm() {
//         try {
//             let submitBtn = document.getElementById('submit-lobby');
//             submitBtn.addEventListener('click', handerlsSubmit);
//         } catch (error) {
//             console.error('Failed to handlersSubmitLobbyForm', error);
//         }
//     }

//     async function handlersCancelLobbyForm() {
//         try {
//             let cancelBtn = document.getElementById('cancel-form');
//             cancelBtn.addEventListener('click', async function cancelForm() {
//                 let submitBtn = document.getElementById('submit-lobby');
//                 submitBtn.removeEventListener('click', handerlsSubmit);
//                 hideNewLobbyForm();
//                 cancelBtn.removeEventListener('click', cancelForm);
//             });
//         } catch (error) {
//             console.error('Failed to handlersCancelLobbyForm', error);
//         }
//     }

//     // ========================= INNER newTournament =========================

//     async function innerAllLobby(allLobby) {
//         try {
//             let lobbyBox = document.getElementById('all_lobby');
//             for (let i = 0; i < allLobby.length; i++) {
//                 let lobby = allLobby[i];
//                 let lobbyDiv = document.createElement('div');
//                 lobbyDiv.classList.add('lobby-element');
//                 lobbyDiv.innerHTML = `
//                     <div id="${lobby.UUID}" class="lobby-element-data">
//                         <span>
//                             ${lobby.name}
//                         </span>
//                         <div>
//                             <span>
//                                 ${lobby.nbr_players} <i class="fa-solid fa-user"></i>
//                             </span>
//                             <span>
//                                 ${lobby.isLocked ? '🟢' : '🟡'}
//                             </span>
//                         </div>
//                     </div>
//                 `;
//                 if (lobby.owner === userId) {
//                     lobbyDiv.innerHTML += `
//                         <div class="lobby-element-btn">
//                             <span id="remove-{${lobby.UUID}}" class="remove-btn" data-lobbyUUID="${lobby.UUID}"><i class="fa-solid fa-xmark"></i></span>
//                         </div>
//                     `;
//                 }
//                 lobbyBox.appendChild(lobbyDiv);
//             }
//         } catch (error) {
//             console.error('Failed to innerAllLobby', error);
//         }   
//     }

//     async function innerNewLobby(newLobby, lobbyName) {
//         try {
//             let lobbyBox = document.getElementById('all_lobby');
//             let lobbyDiv = document.createElement('div');
//             lobbyDiv.classList.add('lobby-element');
//             lobbyDiv.innerHTML = `
//                     <div id="${newLobby}" class="lobby-element-data">
//                         <span>
//                             ${lobbyName}
//                         </span>
//                         <div>
//                             <span>
//                                 1 <i class="fa-solid fa-user"></i>
//                             </span>
//                             <span>
//                                 🟡
//                             </span>
//                         </div>
//                     </div>
//                     <div class="lobby-element-btn">
//                         <span id="remove-{${newLobby}}" class="remove-btn" data-lobbyUUID="${newLobby}"><i class="fa-solid fa-xmark"></i></span>
//                     </div>
//                 `;
//             lobbyBox.appendChild(lobbyDiv);
//         } catch (error) {
//             console.error('Failed to innerNewLobby', error);
//         }
//     }

//     // ========================= handler newTournament =========================

//     async function handlersJoinLobby() {
//         try {
//             let allLobby = document.getElementsByClassName('lobby-element-data');
//             for (let i = 0; i < allLobby.length; i++) {
//                 if (AllLobby.has(allLobby[i].id))
//                     continue;
    
//                 allLobby[i].addEventListener('click', async function () {
//                     let lobbyId = allLobby[i].id;
//                     htmx.ajax('GET', `/game/pong/tournament/lobby?lobby_id=${lobbyId}`, {
//                         target: '#main-content',
//                         swap: 'innerHTML',
//                     }).then(response => {
//                         history.pushState({}, '', `/game/pong/tournament/lobby?lobby_id=${lobbyId}`);
//                     });
//                 });
//                 AllLobby.add(allLobby[i].children[0].id);
//             }
//         } catch (error) {
//             console.error('Failed to joinLobby', error);
//         }
//     }
    
//     async function handlersRemoveLobby() {
//         try {
//             let allRemove = document.getElementsByClassName('remove-btn');
//             for (let i = 0; i < allRemove.length; i++) {
//                 let lobbyUUID = allRemove[i].getAttribute('data-lobbyUUID');
//                 if (Allremove.has(lobbyUUID))
//                     continue;
    
//                 allRemove[i].addEventListener('click', async function () {
//                     await APIremoveLobby(lobbyUUID);
//                     let lobby = document.getElementById(lobbyUUID);
//                     lobby = lobby.parentElement;
//                     lobby.remove();
//                     return;
//                 });
//                 Allremove.add(lobbyUUID);
//             }
//         } catch (error) {
//             console.error('Failed to removeLobby', error);
//         }
//     }

//     initPongTournament();
// }


// pongTournament();