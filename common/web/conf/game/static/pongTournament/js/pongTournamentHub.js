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
