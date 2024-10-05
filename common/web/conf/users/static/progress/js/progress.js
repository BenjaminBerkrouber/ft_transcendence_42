import UiProgress from "./class/UiProgress.js";
import * as API from '../../class/API.js';

document.addEventListener('DOMContentLoaded', async function () {
	let progressBox = document.getElementById('progress-content');
	console.log(progressBox);
	let userId = document.getElementById('progress-content').getAttribute('data-user-id');
	if (!userId) {
		console.error('User id not found');
		return;
	}
	const dataUser = await API.APIgetPlayerById(userId);
	const dataGame = await API.APIgetDataGamesPlayers(dataUser.id);

	const UiProgressManager = new UiProgress();
	await UiProgressManager.init(dataUser, dataGame);

	UiProgressManager.innerGameStats();
	UiProgressManager.innerProgressData();
	UiProgressManager.drawBurger();
	UiProgressManager.drawProgressChart();
	// UiProgressManager.printData();
});

// // =================================================================================================


// let previousWidth = window.innerWidth;
// let previousHeight = window.innerHeight;

// window.addEventListener('resize', updateSizeOfCanvas);

// async function updateSizeOfCanvas() {
//     if (window.innerWidth <= 768)
//         return;

//     if (Math.abs(window.innerWidth - previousWidth) <= 50 && Math.abs(window.innerHeight - previousHeight) <= 50)
//         return;

//     previousWidth = window.innerWidth;
//     previousHeight = window.innerHeight;

//     let canvasGraph = document.getElementById('progress-chart');
//     let parent = canvasGraph.parentElement;
//     canvasGraph.width = parent.clientWidth;
//     canvasGraph.height = parent.clientHeight;
//     toggleMenuStats();
// }

// // =================================================================================================
