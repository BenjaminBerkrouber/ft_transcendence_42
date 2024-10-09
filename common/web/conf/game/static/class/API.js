
async function APIRegisterUser(formData) {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await fetch("/api/register_player/", {
				method: "POST",
				headers: {
					"X-CSRFToken": getCookie("csrftoken"),
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams(formData),
			});
			if (!response.ok) {
				throw new Error("Network response was not ok " + response.statusText);
			}
			resolve(await response.json());
		} catch (error) {
			console.error("Request failed:", error);
			reject(error);
		}
	});
}

async function APILoginUser(formData) {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await fetch("/api/loginPlayer/", {
				method: "POST",
				headers: {
					"X-CSRFToken": getCookie("csrftoken"),
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams(formData),
			});
			if (!response.ok) {
				throw new Error("Network response was not ok " + response.statusText);
			}
			if (response.status !== 200) {
				return reject(await response.json());
			}
			resolve(await response.json());
		} catch (error) {
			console.error("Request failed:", error);
			reject(error);
		}
	});
}

async function APIudpateData(formData) {
	const data = {
        username: formData.get('username'),
        email: formData.get('email')
    };
	return fetch("/api/updateDataPlayer/", {
		method: "POST",
		headers: {
			"X-CSRFToken": getCookie("csrftoken"),
			"Content-Type": "application/json",
		},
        body: JSON.stringify(data),
	})
	.then(response => {
		return response.json();
	})
	.catch(error => {
		console.error("Failed to add up data:", error);
		throw error;
	});
}

async function APIupdatePassword(formData) {
	const data = {
        old_password: formData.get('old_password'),
        new_password: formData.get('new_password'),
		confirm_password: formData.get('confirm_password')
    };
	return fetch("/api/updatePassword/", {
		method: "POST",
		headers: {
			"X-CSRFToken": getCookie("csrftoken"),
			"Content-Type": "application/json",
		},
        body: JSON.stringify(data),
	})
	.then(response => {
		return response.json();
	})
	.catch(error => {
		console.error("Failed to add up data:", error);
		throw error;
	});
}

async function APIgetPlayer() {
	return new Promise(async (resolve, reject) => {
		resolve(await getFetchAPI(`/api/getPlayer/`));
	});
}

async function APIgetPlayerById(userId) {
	return new Promise(async (resolve, reject) => {
		resolve(await getFetchAPI(`/api/getPlayerById?userId=${userId}`));
	});
}

async function APIgetDataGamesPlayers(userId) {
	return new Promise(async (resolve, reject) => {
		let gamesData = await getFetchAPI(`/api/getDataGamesPlayers?userId=${userId}`);
		resolve(gamesData.data);
	});
}


async function APIupdateProfilPicsPlayer(file) {
	return new Promise(async(resolve, reject) => { 
		const formData = new FormData();
		formData.append('avatar', file);
		let resp = await fetch('/api/updateProfilPicsPlayer/', {
			method: 'POST',
			headers: {
				'X-CSRFToken': getCookie('csrftoken'),
			},
			mode: 'same-origin',
			body: formData, 
		});
		if (!resp.ok || resp.status !== 200) {
			console.error('Network response was not ok ' + resp.statusText);
		}
		resp = await resp.json();
		resolve(resp);
	});
}



async function getFetchAPI(url) {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await fetch(url, {
				method: "GET",
				headers: {
					"X-CSRFToken": getCookie("csrftoken"),
					"Content-Type": "application/json",
				},
			});
			resolve(await response.json());
		} catch (error) {
			console.error("Failed to fetch API", error);
			reject(error);
		}
	});
}

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

export {
	APIRegisterUser,
	APILoginUser,
	APIgetPlayer,
	APIgetPlayerById,
	APIgetDataGamesPlayers,
	APIupdateProfilPicsPlayer,
	APIudpateData,
	APIupdatePassword,
	getFetchAPI,
	getCookie,
};