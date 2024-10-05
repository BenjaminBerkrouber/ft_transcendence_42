import UiProfile from "./class/UiProfil.js";
import * as API from '../../class/API.js';

document.addEventListener('DOMContentLoaded', async function () {
	let userId = document.getElementById('profil-content').getAttribute('data-user-id');
	const dataUser = await API.APIgetPlayerById(userId);
	const dataGame = await API.APIgetDataGamesPlayers(dataUser.id);

	const UiProfil = new UiProfile();
	UiProfil.init(dataUser, dataGame);

	await UiProfil.innerForm();
	await UiProfil.innerUserData();
	await UiProfil.innerGameStats();
	await UiProfil.handlerChangeSowHistory();
	
	// UiProfil.printData();

});
