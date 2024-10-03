async function loadProfile() {

	handlerUpdatePP();
	handlerUpdateData();
	toggleBackPanel();
	toggleBackPasswordPanel();
	toggleAllPasswords();
	toggleShowStats();
};


// ===================== Profile utils =====================

function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

async function APIupdatePP(file) {
	return new Promise(async(resolve, reject) => { 
		const formData = new FormData();
		formData.append('avatar', file);
		let resp = await fetch('/api/updateImg/', {
			method: 'POST',
			headers: {
				'X-CSRFToken': getCookie('csrftoken'),
			},
			mode: 'same-origin',
			body: formData, 
		});
		resp = await resp.json();
		resolve(resp);
	});
}

async function APIudpateData(username, email) {
	return fetch("/api/updateData/", {
		method: "POST",
		headers: {
			"X-CSRFToken": getCookie("csrftoken"),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ username, email }),
	})
	.then(response => {
		return response.json();
	})
	.catch(error => {
		console.error("Failed to add up data:", error);
		throw error;
	});
}

async function APIupdatePassword(old_password, new_password, confirm_password) {
	return fetch("/api/updatePassword/", {
		method: "POST",
		headers: {
			"X-CSRFToken": getCookie("csrftoken"),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ old_password, new_password, confirm_password }),
	})
	.then(response => {
		return response.json();
	})
	.catch(error => {
		console.error("Failed to add up data:", error);
		throw error;
	});
}


// ===================== Profile handler =====================

async function handlerUpdatePP() {
	try {
		document.getElementById('upload-avatar-label').addEventListener('click', function () {
			document.getElementById('uploadAvatar').click();
		});

		document.getElementById('uploadAvatar').addEventListener('change', async function () {
			const file = this.files[0];
			if (file) {
				let resp = await APIupdatePP(file);
				if (resp.status == 400)
					return alert('An error occurred while updating avatar');
				document.getElementById('profile-avatar').src = resp.new_avatar_url;
			}
		});
	} catch (e) {
		console.error(e);
	}
}

async function handlerUpdateData() {
	document.getElementById('edit-btn').addEventListener('click', function () {
		document.getElementById('edit-panel').classList.toggle('active');
		toggleEditPanel();
	});
	
	document.getElementById('edit-password-btn').addEventListener('click', function () {
		document.getElementById('edit-password-panel').classList.toggle('active');
	});
}

async function toggleBackPanel() {
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

async function toggleBackPasswordPanel() {
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


// ===================== Profile toggle =====================

async function toggleEditPanel() {
	try {
		let editData = document.getElementById('submit-edit-data');
		editData.addEventListener('click', async (e) => {
			e.preventDefault();
			try {
				let username = editData.form.username.value;
				let email = editData.form.email.value;
				if (username == '' || email == '') {
					let errorBox = document.getElementById('error-content');
					errorBox.textContent = 'Please fill in all fields';
					return;
				}
				if (!validateEmailUpdate(email)) {
					let errorBox = document.getElementById('error-content');
					errorBox.textContent = 'Invalid email';
					return;
				}
				let resp = await APIudpateData(username, email);
				if (resp.success == false) {
					let errorBox = document.getElementById('error-content');
					errorBox.textContent = resp.error;
					return;
				} else {
					let errorBox = document.getElementById('error-content');
					errorBox.textContent = 'Your profil has been updated';
				}
				document.getElementById('username').textContent = resp.new_username;
				document.getElementById('username-profil').textContent = resp.new_username;
				document.getElementById('email').textContent = resp.new_email;
			} catch (e) {
				console.error(e);
			}
		});

		let editPassword = document.getElementById('submit-edit-password');
		editPassword.addEventListener('click', async (e) => {
			e.preventDefault();
			try {
				let old_password = editPassword.form.old_password.value;
				console.log(old_password);
				let new_password = editPassword.form.new_password.value;
				console.log(new_password);
				let confirm_password = editPassword.form.confirm_password.value;
				console.log(confirm_password);
				let resp = await APIupdatePassword(old_password, new_password, confirm_password);
				if (resp.success == false) {
					let errorBox = document.getElementById('error-content-pass');
					errorBox.textContent = resp.error;
					return;
				}
				document.getElementById('edit-password-panel').classList.toggle('active');
			} catch (e) {
				console.error(e);
			}
		});

	} catch (e) {
		console.error(e);
	}
}

async function toggleAllPasswords() {
    try {
        let toggleButtons = document.querySelectorAll('.toggle-password');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', function () {
                let passwordFieldId = button.id.replace('toggle-', '');
                let passwordField = document.getElementById(passwordFieldId);
                
                if (passwordField.type === 'password') {
                    passwordField.type = 'text';
                    button.innerHTML = '<i class="fa-solid fa-eye"></i>';
                } else {
                    passwordField.type = 'password';
                    button.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
                }
            });
        });
    } catch (e) {
        console.error(e);
    }
}

async function toggleShowStats() {
	try {
		let statsOptions = document.querySelectorAll('.select-game-history-option');
		statsOptions.forEach(option => {
			option.addEventListener('click', function () {
				statsOptions.forEach(option => {
					option.classList.remove('active');
				});
				option.classList.add('active');
				let statsPanel = document.getElementById('game-history-panel');
				statsPanel.innerHTML = '';
				let type = option.getAttribute('data-type');
				
				loadStats(type);
			});
		});
	} catch (e) {
		console.error(e);
	}
}

loadProfile();


async function innerNoGames() {
	let statsPanel = document.getElementById('game-history-panel');
	statsPanel.innerHTML = `
		<div class="no-match">
			<p>No matches played yet</p>
		</div>
	`;
}

async function innerStats(games) {
	try {
		let statsPanel = document.getElementById('game-history-panel');
		if (games.length == 0) {
			innerNoGames();
			return;
		}

		for (const data of games) {
			console.log(data);
			let game = document.createElement('div');
			game.classList.add('match');
			game.innerHTML = `
				<div class="player-info img-box-match">
					<img src="${data.p1_img}" alt=" ${data.player1_username}" class="img-match ${data.player1_username == data.winner_username ? 'online' : 'offline'}">
					<span class="split-match">/</span>
					<img src="${data.p2_img}" alt=" ${data.player2_username}" class="img-match ${data.player2_username == data.winner_username ? 'online' : 'offline'}">
				</div>
				<div class="match-info">${ data.time_minutes }m ${ data.time_seconds }s</div>
				<div class="match-winner">${ data.winner_username }</div>
				<div class="match-elo">
					<span style="color: ${data.elo_player1 > 0 ? 'green' : 'red'};">${data.elo_player1}</span>
					<span class="split-match">/</span>
					<span style="color: ${data.elo_player2 > 0 ? 'green' : 'red'};">${data.elo_player2}</span>
				</div>
			`;
			statsPanel.appendChild(game);
		}
	} catch (e) {
		console.error(e);
	}
}

async function innerShowProgress(games, type, currentUser) {
	try {
		let progressButton = document.getElementById('progress-button');
		console.log(progressButton);
		if (games.length == 0) { 
			progressButton.innerHTML = ``;
			progressButton.style.display = 'none';
			return;
		}
		progressButton.style.display = 'block';
        let href = (type === 'connect4' ? `/progress/connect4?user=${currentUser}` : `/progress/pong?user=${currentUser}`);
		console.log(href);
		progressButton.innerHTML = `<a id="progress-link" hx-get="${href}" hx-target="#main-content" hx-push-url="true" href="${href}" class="btn">Show My Progress</a>`
		
		let progressLink = document.getElementById('progress-link');
		progressLink.addEventListener('click', async (e) => {
			e.preventDefault();
			let href = e.currentTarget.href;
			htmx.ajax('GET', href, {
				target: '#main-content', // The target element to update
				swap: 'innerHTML', // How to swap the content
			}).then(response => {
				history.pushState({}, '', href);
			});
		});
	} catch (e) {
		console.error(e);
	}
}

async function loadStats(type) {
	try {
		let statsPanel = document.getElementById('game-history-panel');
		let games = [];
		console.log('debog' + document.getElementById('id-profil'));
		let currentUser = document.getElementById('id-profil').getAttribute('data-user');
		console.log(currentUser);
		if (type == 'connect4')
			games = await APIgetConnect4GameForUser(currentUser);
		else
			games = await APIgetPongGameForUser(currentUser);
		let noGames = document.querySelector('.no-match');
		if (noGames)
			noGames.remove();
		innerStats(games.match_data);
		innerShowProgress(games.match_data, type, currentUser);
	} catch (e) {
		console.error(e);
	}
}

// ===================== CHECK UPDATE DATA	 =====================

function validateEmailUpdate(email) {
	const re = /\S+@\S+\.\S+/;
	return re.test(email);
}