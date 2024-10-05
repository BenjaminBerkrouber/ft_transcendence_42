import IDataUserManager from "../../../class/IDataUserManager.js";
import FormUpdateProfil from "./FormUpdateProfil.js";
import FormUpdatePassword from "./FormUpdatePassword.js";
import * as API from "../../../class/API.js";

class UiProfile extends IDataUserManager {
    constructor() {
        super();

        this.elementsToUpdate = null
        this.gameHistoryType = true;
    }

    async init(userData, gameData) {
        await super.init(userData, gameData);
        this.elementsToUpdate = {
            "profile-avatar": {
                value: '',
                func: () => this.PlayerData.getImg(),
                type: 'src'
            },
            "profil-username": {
                value: '',
                func: () => this.PlayerData.getUsername(),
                type: 'innerHTML'
            },
            "profil-firends-count": {
                value: `<i class="fas fa-user-friends"></i>`,
                func: () => this.PlayerData.getFriendsCount(),
                type: 'innerHTML'
            },
            "profil-tournameWin-count": {
                value: `<i class="fas fa-trophy"></i>`,
                func: () => null, // a FAIRE
                type: 'innerHTML'
            },
            "profil-elo-pong": {
                value: `<i class="fas fa-chess-board"></i>`,
                func: () => this.PlayerData.getEloPong(),
                type: 'innerHTML'
            },
            "profil-elo-connect4": {
                value: `<i class="fas fa-table-tennis"></i>`,
                func: () => this.PlayerData.getEloConnect4(),
                type: 'innerHTML'
            },
        };
    }



    async innerForm() {
        try {
            if (!this.PlayerData.getIs42User() && !this.PlayerData.getVisitedProfile()) {
                await this.innerUserUpdateProfilPicturs();
                await this.innerUserUpdateProfil();
                await this.innerUpdateDataForm();
            }
        } catch (error) {
            console.error("An error occurred in innerUserData", error);
        }
    }

    async innerUserData() {
        try {
            for (const [id, { value, func, type }] of Object.entries(this.elementsToUpdate)) {
                const element = document.getElementById(id);
                if (!element) continue;
                const dynamicValue = func();
                if (type === 'src') {
                    element.src = dynamicValue;
                } else if (type === 'innerHTML') {
                    element.innerHTML = value + dynamicValue;
                }
            }
        } catch (error) {
            console.error("An error occurred in innerUserData", error);
        }
    }

    async innerUserUpdateProfilPicturs() {
        try {
            let userDataBox = document.getElementById("id-profil");
            if (!userDataBox) return;
            userDataBox.innerHTML += `
                    <div class="overlay">
                        <label for="uploadAvatar" id="upload-avatar-label">
                            <i class="fa-regular fa-image"></i>
                        </label>
                        <input type="file" id="uploadAvatar" style="display: none;" accept="image/*">
                    </div>
                `;
            this.handlerUpdatePP();
        } catch (error) {
            console.error("An error occured in innerUserUpdateProfilPicturs", error);
        }
    }

    async innerUserUpdateProfil() {
        try {
            let editProfilBoxBtn = document.getElementById("edit-profil-box-btn");
            if (!editProfilBoxBtn) return;
            editProfilBoxBtn.innerHTML = `
                    <button class="edit-btn" id="edit-btn">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                `;
            this.handlerShowEditPanel();
        } catch (error) {
            console.error("An error occured in innerUserUpdateProfil", error);
        }
    }

    async handlerShowEditPanel() {
        try {
            const editBtn = document.getElementById("edit-btn");
            editBtn.addEventListener("click", () => {
                const editPanel = document.getElementById("edit-panel");
                if (!editPanel) return;
                editPanel.classList.toggle('active');
            });
        } catch (error) {
            console.error("An error occured in handlerShowEditPanel", error);
        }
    }

    async innerUpdateDataForm() {
        try {
            let boxUpdateDataForm = document.getElementById("box-update-data-form");
            if (!boxUpdateDataForm) return;
            boxUpdateDataForm.innerHTML = `
            <div id="edit-panel" class="edit-panel">
                <div class="top-panel">
                    <div class="box-top-info">
                        <h2>Edit Profile</h2>
                        <button id="back-btn-edit" class="btn btn-link">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div class="line-edit-profil"></div>
                </div>
                <div class="bot-panel">
                    <form id="edit-form" method="post">
                        <div class="warp-input">
                            <span class="valid-indicator" id="username-indicator"
                                title="Invalid username format"></span>
                            <input type="text" name="username" id="username" value="${this.PlayerData.getUsername()}" required>
                            <label for="username" class="input-label">Username :</label>
                        </div>
                        <div class="warp-input">
                            <span class="valid-indicator" id="email-indicator" title="Invalid email format"></span>
                            <input type="email" name="email" id="email" value="${this.PlayerData.getMail()}" required>
                            <label for="email" class="input-label">Email :</label>
                        </div> 
                        <div class="error-box">
                            <span id="error-content"></span>
                        </div>
                        <div class="form-btn">
                            <button type="submit" id="submit-edit-data">Update</button>
                        </div>
                    </form>
                </div>
                <div id="edit-password-container">
                    <button id="edit-password-btn">Change Password</button>
                </div>
                <div id="edit-password-panel" class="edit-panel">
                    <div class="top-panel">
                        <div class="box-top-info">
                            <h2>Change Password</h2>
                            <button id="back-btn-edit-password" class="btn btn-link">
                                <i class="fas fa-arrow-left"></i>                        
                            </button>
                        </div>
                        <div class="line-edit-profil"></div>
                    </div>
                    <div class="bot-panel">
                        <form id="edit-password-form" method="post" action="/api/updatePass/">
                            <div class="warp-input">
                                <span class="valid-indicator" id="old-password-indicator"
                                    title="Invalid password format"></span>
                                <input type="password" name="old_password" id="old-password" required>
                                <label for="old-password" class="input-label">Current Password :</label>
                                <button type="button" class="toggle-password" id="toggle-old-password">
                                    <i class="fa-solid fa-eye-slash"></i>
                                </button>
                            </div>
                            <div class="warp-input">
                                <span class="valid-indicator" id="new-password-indicator"
                                    title="Invalid password format"></span>
                                <input type="password" name="new_password" id="new-password" required>
                                <label for="new-password" class="input-label">New Password :</label>
                                <button type="button" class="toggle-password" id="toggle-new-password">
                                    <i class="fa-solid fa-eye-slash"></i>
                                </button>
                            </div>
                            <div class="warp-input">
                                <span class="valid-indicator" id="confirm-password-indicator"
                                    title="Passwords do not match"></span>
                                <input type="password" name="confirm_password" id="confirm-password" required>
                                <label for="confirm-password" class="input-label">Confirm New Password :</label>
                                <button type="button" class="toggle-password" id="toggle-confirm-password">
                                    <i class="fa-solid fa-eye-slash"></i>
                                </button>
                            </div>
                            <div class="error-box">
                                <span id="error-content-pass"></span>
                            </div>
                            <div class="form-btn">
                                <button type="submit" id="submit-edit-password">Update</button>
                            </div>
                        </form>
                    </div>
                </div>        
            </div>
        `;
            this.handlerUpdateDataForm();
            this.handlerShowEditPassword();
            this.handlerUpdatePasswordForm();
            this.toggleBackPanel();
            this.toggleBackPasswordPanel();
        } catch (error) {
            console.error("An error occured in innerUpdateDataForm", error);
        }
    }

    /**
     * handlerUpdateDataForm
     * 
     * This method is responsible for processing the form data and sending it to the
     * ProfilUpdate API. It uses the `APIudpateData` function to authenticate the user with the
     * provided ProfilUpdate credentials.
     * 
     * @async
     * @function handlerUpdateDataForm
     * 
     * @throws {Error} - Throws an error if the API request fails or if the response is not valid.
     * 
     * @memberof UiProfile
     */
    async handlerUpdateDataForm() {
        try {
            new FormUpdateProfil();
            let boxErrorContent = document.getElementById("error-content");
            boxErrorContent.addEventListener("contentUpdated", (event) => {
                let data = event.detail.message;
                if (!data.username || !data.email) return;
                this.PlayerData.setUsername(data.username);
                this.PlayerData.setMail(data.email);
                this.innerUserData();
            });
        } catch (error) {
            console.error("An error occured in handlerUpdateDataForm", error);
        }
    }

    async handlerShowEditPassword() {
        try {
            document.getElementById('edit-password-btn').addEventListener('click', function () {
                document.getElementById('edit-password-panel').classList.toggle('active');
            });
        } catch (error) {
            console.error("An error occured in handlerShowEditPassword", error);
        }
    }

    async handlerUpdatePasswordForm() {
        try {
            new FormUpdatePassword();
        } catch (error) {
            console.error("An error occured in handlerUpdatePasswordForm", error);
        }
    }


    async toggleBackPanel() {
        try {
            let backBtnEdit = document.getElementById('back-btn-edit');
            backBtnEdit.addEventListener('click', function () {
                let editPanel = document.getElementById('edit-panel');
                editPanel.classList.toggle('active');
            });
        } catch (e) {
            console.error(e);
        }
    }

    async toggleBackPasswordPanel() {
        try {
            let backBtnPassword = document.getElementById('back-btn-edit-password');
            backBtnPassword.addEventListener('click', function () {
                let editPasswordPanel = document.getElementById('edit-password-panel');
                editPasswordPanel.classList.toggle('active');
            });
        } catch (e) {
            console.error(e);
        }
    }

    async handlerUpdatePP() {
        try {
            const uploadAvatar = document.getElementById("uploadAvatar");
            uploadAvatar.addEventListener("change", async (event) => {
                const file = event.target.files[0];
                if (file) {
                    const fileType = file.type.split('/')[0];
                    if (fileType !== 'image') return alert('Invalid file type');
                    if (file.size > 1 * 1024 * 1024 || file.size < 5) return alert('Invalide file size');
                    if (file.size === 0) return alert('File is empty'); // A FAIRE
                    // if (file.type !== 'image/jpeg' && file.type !== 'image/png' || file.type !== 'image/jpg') {
                    //     console.log(file.type);
                    //     return alert('Invalid file type, only jpeg, jpg and png are allowed');
                    // }
                    let resp = await API.APIupdateProfilPicsPlayer(file);
                    if (resp.status == 400) return alert('Invalid file type', resp.error);
                    document.getElementById('profile-avatar').src = resp.new_avatar_url;
                    this.PlayerData.setImg(resp.new_avatar_url);
                }
            });
        } catch (e) {
            console.error(e);
        }
    }

    innerGameLegend() {
        try {
            let gameLegendBox = document.getElementById('match-legend');
            if (!gameLegendBox) return;
            gameLegendBox.innerHTML = `
                <div class="legend-item player-info">Players</div>
                <div class="legend-item match-info">Time</div>
                <div class="match-winner legend-item">Winner</div>
                <div class="legend-item match-elo">ELO</div>
            `;
        } catch (error) {
            console.error("An error occured in innerGameLegend", error);
        }
    }

    innerGames() {
        const gameHistoryBox = document.getElementById('game-history-panel');
        if (!gameHistoryBox) return;
    
        this.innerGameLegend();
        const games = this.gameHistoryType ? this.GameUserData.getPongGames() : this.GameUserData.getConnect4Games();
        
        games.forEach(game => {
            const newGame = document.createElement('div');
            newGame.classList.add('match');
            const userBox = this.createUserBox(game);
            const timeBox = this.createTimeBox(game);
            const winnerBox = this.createWinnerBox(game);
            const eloBox = this.createEloBox(game);
            this.appendGameElements(newGame, userBox, timeBox, winnerBox, eloBox);
            gameHistoryBox.appendChild(newGame);
        });
    }
    
    createUserBox(game) {
        const userBox = document.createElement('div');
        userBox.classList.add('player-info', 'img-box-match');
        for (const player of game.getPlayers()) {
            const newImg = document.createElement('img');
            newImg.src = player.getImg();
            newImg.alt = player.getUsername();
            newImg.classList.add('img-match', player.getUsername() === game.getWinner().getUsername() ? 'online' : 'offline');
            userBox.appendChild(newImg);
        }
        return userBox;
    }
    
    createTimeBox(game) {
        const timeBox = document.createElement('div');
        timeBox.classList.add('match-info');
        timeBox.innerHTML = `${game.getTimeMinutes()}m ${game.getTimeSeconds()}s`;
        return timeBox;
    }
    
    createWinnerBox(game) {
        const winnerBox = document.createElement('div');
        winnerBox.classList.add('match-winner');
        winnerBox.innerHTML = game.getWinner().getUsername();
        return winnerBox;
    }
    
    createEloBox(game) {
        const eloBox = document.createElement('div');
        eloBox.classList.add('match-elo');
        const eloValue = game.getNewEloByPlayerIdForGame(this.PlayerData.getId());
        eloBox.innerHTML = `
            <span style="color: ${eloValue > 0 ? 'green' : 'red'};">${eloValue > 0 ? '+' : '-'} ${Math.abs(eloValue)}</span>
        `;
        return eloBox;
    }
    
    appendGameElements(newGame, userBox, timeBox, winnerBox, eloBox) {
        newGame.appendChild(userBox);
        newGame.appendChild(timeBox);
        newGame.appendChild(winnerBox);
        newGame.appendChild(eloBox);
    }

    async innerGameStats() {
        try {
            let bool = this.gameHistoryType ? this.GameUserData.getNbrPongGames() > 0 : this.GameUserData.getNbrConnect4Games() > 0;
            let funcInnerGame = bool ? this.innerGames : this.innerNoGames;
            let funcInnerLinkShowProgress = bool ? this.innerLinkShowProgress : this.removeLinkShowProgress;
            funcInnerGame.call(this);
            funcInnerLinkShowProgress.call(this);
        } catch (error) {
            console.error("An error occured in innerGameStats", error);
        }
    }

    async innerLinkShowProgress() {
        try {
            let boxLinkShowPassword = document.getElementById('box-link-progress');
            if (!boxLinkShowPassword) return;
            let type = this.gameHistoryType ? 'Pong' : 'Connect4';
            let link = `/progress/?username=${this.PlayerData.getUsername()}&type=${type}`;
            boxLinkShowPassword.innerHTML = `
                <div class="progress-button" id="progress-button">
                    <a id="progress-link" href=${link}" class="btn">Show Progress</a>
                </div>
            `;
        } catch (error) {
            console.error("An error occured in innerLinkShowProgress", error);
        }
    }

    async removeLinkShowProgress() {
        try {
            let boxLinkShowPassword = document.getElementById('box-link-progress');
            if (!boxLinkShowPassword) return;
            boxLinkShowPassword.innerHTML = ``;
        } catch (error) {
            console.error("An error occured in removeLinkShowProgress", error);
        }
    }


    async innerNoGames() {
        let gameLegendBox = document.getElementById('match-legend');
        if (!gameLegendBox) return;
        gameLegendBox.innerHTML = '';
        let statsPanel = document.getElementById('game-history-panel');
        if (!statsPanel) return;
        statsPanel.innerHTML = `
            <div class="no-match">
                <p>No matches played yet</p>
            </div>
        `;
    }

    async innerGameHistory() {
        try {
            await this.innerGameStats();
            await this.handlerChangeSowHistory();
        } catch (error) {
            console.error("An error occured in innerGameHistory", error);
        }
    }

    async handlerChangeSowHistory() {
        try {
            let statsOptions = document.querySelectorAll('.select-game-history-option');
            statsOptions.forEach(option => {
                option.addEventListener('click', () => {
                    statsOptions.forEach(option => {
                        option.classList.toggle('active');
                    });
                    this.gameHistoryType = !this.gameHistoryType;
                    this.innerGameStats();
                });
            });
        } catch (e) {
            console.error('error occured in handlerSowHistory', e);
        }
    }
}

export default UiProfile;