// api.js

// ============================== REQUEST API PART ==============================




// ==========================================================================
// API FOR CHAT	
// ==========================================================================




async function APIgetCurrentUser() {
	return new Promise(async (resolve, reject) => {
		resolve(await getFetchAPI("/api/@me"));
	});
}

async function APIgetChatUsers() {
	return new Promise(async (resolve, reject) => {
		resolve(await getFetchAPI("/api/getChatUser"));
	});
}

async function APIgetSocialUsers() {
	return new Promise(async (resolve, reject) => {
		resolve(await getFetchAPI("/api/getSocialUser"));
	});
}

async function APIgetMessages(contactId) {
	return new Promise(async (resolve, reject) => {
		resolve(await getFetchAPI(`/api/getMessages?contactId=${contactId}`));
	});
}

async function APIgetHashRoom(roomName) {
	return new Promise(async (resolve, reject) => {
		resolve(await getFetchAPI(`/api/getHashRoom?roomName=${roomName}`));
	});
}

async function APIgetGlobalNotif(userId) {
	return new Promise(async (resolve, reject) => {
		resolve(await getFetchAPI(`/api/getGlobalNotif?userId=${userId}`));
	});
}

async function APIremoveChatNotif(userId) {
	return new Promise(async (resolve, reject) => {
		resolve(await getFetchAPI(`/api/removeChatNotif?userId=${userId}`));
	});
}

async function APIgetNbrChatNotif(userId) {
	return new Promise(async (resolve, reject) => {
		let nbrChatNotif = await getFetchAPI(`/api/getNbrChatNotif?userId=${userId}`);
		resolve(nbrChatNotif.nbrNotif);
	});
}

async function APIgetNbrSocialNotif(userId) {
	return new Promise(async (resolve, reject) => {
		let nbrSocialNotif = await getFetchAPI(`/api/getNbrSocialNotif?userId=${userId}`);
		resolve(nbrSocialNotif.nbrNotif);
	});
}

async function APIgetUserById(userId) {
	return new Promise(async (resolve, reject) => {
		let user = await getFetchAPI(`/api/getUserById?userId=${userId}`);
		resolve(user);
	});
}

async function APIclearNotifSocial() {
	return new Promise(async (resolve, reject) => {
		let game = await getFetchAPI(`/api/clearNotifSocial`);
		resolve(game);
	});
}

async function APIclearNotifChatFor(userId) {
	return new Promise(async (resolve, reject) => {
		let game = await getFetchAPI(`/api/clearNotifChatForUser?userId=${userId}`);
		resolve(game);
	});
}


async function APIsendMessage(contactId, message) {
    try {
        const response = await fetch(`/api/sendMessage/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contactId, message }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        return response.json();
    } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
    }
}

async function APIsendGameInvite(contactId) {
    try {
        const response = await fetch(`/api/sendInvite/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contactId }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        return response.json();
    } catch (error) {
        console.error('Failed to send game invite:', error);
        throw error;
    }
}

async function APIupdateInviteStatus(contactId, status) {
    try {
        const response = await fetch(`/api/updateInviteStatus/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contactId: contactId,
                status: status,
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        return response.json();
    } catch (error) {
        console.error('Failed to update invite status:', error);
        throw error;
    }
}

function APIupdateSocialStatus(socialUserId, friendStatus) {
    return fetch("/api/updateSocialStatus/", {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ socialUserId, friendStatus }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .catch(error => {
        console.error("Failed to update social status:", error);
        throw error;
    });
}



// ==========================================================================








async function APIgetUserAvailableToLobby(lobbyUUID) {
	return new Promise(async (resolve, reject) => {
		resolve(await getFetchAPI(`/api/getUserAvailableToLobby?lobbyUUID=${lobbyUUID}`));
	});
}

async function APIcreateLobby(userId, lobbyName) {
	return new Promise(async (resolve, reject) => {
		let lobbyTournament = await getFetchAPI(`/api/createLobby?userId=${userId}&lobbyName=${lobbyName}`);
		resolve(lobbyTournament);
	});
}

async function APIgetAllLobby() {
	return new Promise(async (resolve, reject) => {
		let allLobby = await getFetchAPI(`/api/getAllLobby`);
		resolve(allLobby);
	});
}

async function APIgetTournamentInfo(tournamentUUID) {
	return new Promise(async (resolve, reject) => {
		let game = await getFetchAPI(`/api/getTournamentInfo?tournamentUUID=${tournamentUUID}`);
		resolve(game);
	});
}


async function APIgetConnect4GameForUser(userId) {
	return new Promise(async (resolve, reject) => {
		let game = await getFetchAPI(`/api/getConnect4GameForUser?userId=${userId}`);
		resolve(game);
	});
}

async function APIgetPongGameForUser(userId) {
	return new Promise(async (resolve, reject) => {
		let game = await getFetchAPI(`/api/getPongGameForUser?userId=${userId}`);
		resolve(game);
	});
}

async function APIfinishGameOnlyIa(lobbyUUID) {
	return new Promise(async (resolve, reject) => {
		let game = await getFetchAPI(`/api/finishGameOnlyIa?lobbyUUID=${lobbyUUID}`);
		resolve(game);
	});
}

async function APIgetLobbyIsLocked(lobbyUUID) {
	return new Promise(async (resolve, reject) => {
		let game = await getFetchAPI(`/api/getLobbyIsLocked?lobbyUUID=${lobbyUUID}`);
		resolve(game);
	});
}

async function APIremoveLobby(lobbyUUID) {
	return new Promise(async (resolve, reject) => {
		let game = await getFetchAPI(`/api/removeLobby?lobbyUUID=${lobbyUUID}`);
		resolve(game);
	});
}


// pongCustome

async function APIgetDataCustomGame(idCustomGame) {
	return new Promise(async (resolve, reject) => {
		let game = await getFetchAPI(`/api/getPongCustomData?idCustomGame=${idCustomGame}`);
		resolve(game);
	});
}

async function APIgetSessionPongCustomGame() {
	return new Promise(async (resolve, reject) => {
		let game = await getFetchAPI(`/api/getSessionPongCustomGame`);
		resolve(game);
	});
}

function APIsaveCustomAtSession(pongCustom) {
    return fetch("/api/setSessionPongCustomGame/", {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ pongCustom }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .catch(error => {
        console.error("Failed to update social status:", error);
        throw error;
    });
}


//  OTHER



async function APIaddPlayerToLobby(lobbyUUID, userId) {
	return fetch("/api/addPlayerToLobby/", {
		method: "POST",
		headers: {
			"X-CSRFToken": getCookie("csrftoken"),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ lobbyUUID, userId }),
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok ' + response.statusText);
		}
		return response.json();
	})
	.catch(error => {
		console.error("Failed to add player to lobby:", error);
		throw error;
	});
}

async function APIlockLobby(lobbyUUID) {
	return fetch("/api/lockLobby/", {
		method: "POST",
		headers: {
			"X-CSRFToken": getCookie("csrftoken"),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ lobbyUUID }),
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok ' + response.statusText);
		}
		return response.json();
	})
	.catch(error => {
		console.error("Failed to lock lobby:", error);
		throw error;
	});
}

async function APIredirectTournament(tournamentorganized) {
	return fetch("/api/redirectTournament/", {
		method: "POST",
		headers: {
			"X-CSRFToken": getCookie("csrftoken"),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ tournamentorganized }),
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok ' + response.statusText);
		}
		return response.json();
	})
	.catch(error => {
		console.error("Failed to redirect tournament:", error);
		throw error;
	});
}

async function APIaddIaToLobby(lobbyUUID) {
	return fetch("/api/addIaToLobby/", {
		method: "POST",
		headers: {
			"X-CSRFToken": getCookie("csrftoken"),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ lobbyUUID }),
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok ' + response.statusText);
		}
		return response.json();
	})
	.catch(error => {
		console.error("Failed to add player to lobby:", error);
		throw error;
	});
}

async function APIsetWinnerAtTournamentGame(idGame, idWinner, isIa) {
	return fetch("/api/setWinnerAtTournamentGame/", {
		method: "POST",
		headers: {
			"X-CSRFToken": getCookie("csrftoken"),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ idGame, idWinner, isIa }),
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok ' + response.statusText);
		}
		return response.json();
	})
	.catch(error => {
		console.error("Failed to add player to lobby:", error);
		throw error;
	});
}

async function APIsaveCustomGame(data, idGame) {
	return fetch("/api/setPongCustomGame/", {
		method: "POST",
		headers: {
			"X-CSRFToken": getCookie("csrftoken"),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ data, idGame}),
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok ' + response.statusText);
		}
		return response.json();
	})
	.catch(error => {
		console.error("Failed to add player to lobby:", error);
		throw error;
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