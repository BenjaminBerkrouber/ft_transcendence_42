import UILobby from "./class/UiLobby.js";

document.addEventListener('DOMContentLoaded', async function () {
    let lobbyUUID = document.getElementById('lobby_uuid').getAttribute('data-value').replace(/-/g, '');
    let dataUser = await APIgetCurrentUser();
    let lobbyData = await APIgetLobbyData(lobbyUUID);
    let uiLobby = new UILobby();
    uiLobby.init(lobbyData.data, dataUser);
    uiLobby.innerContent();
});