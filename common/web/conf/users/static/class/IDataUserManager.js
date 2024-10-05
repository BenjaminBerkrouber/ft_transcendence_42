import IPlayerData from './IPlayerData.js';
import IGameUserData from './IGameUserData.js';

class IDataUserManager {
	constructor() {
		this.PlayerData = new IPlayerData();
		this.GameUserData = new IGameUserData();
	}

	async init(userData, gameData) {
		this.PlayerData.init(userData);
		if (!gameData)
			return;
		this.GameUserData.init(gameData);
	}

	getPlayerData() {
		return this.PlayerData;
	}

	getGameUserData() {
		return this.GameUserData;
	}


	printData() {
		this.PlayerData.printData();
		this.GameUserData.printData();
	}
}

export default IDataUserManager;