document.addEventListener('DOMContentLoaded', async function () {
    let boxNotif = document.getElementById('notif-box');
    let Notifitems = boxNotif.getElementsByClassName('notif-items');
    let user = await APIgetCurrentUser();
    let roomName = await APIgetHashRoom('notif_'+ user.id);
    connectWSNotif(roomName.roomName);
    handlerHideNotif(Notifitems);
    handlerRedirectOnClick(Notifitems);
});

// =============================== HANDLER NOTIF ================================

async function handlerRedirectOnClick(Notifitems) {
    try {
        for (let item of Notifitems) {
            let redirectBtn = item.getElementsByClassName('redirect-notif')[0];
            redirectBtn.addEventListener('click', async function (e) {
                e.preventDefault();
                console.log('redirectBtn clicked');
                let link = item.getAttribute('data-value');
                console.log('link', link);
                htmx.ajax('GET', link, {
                    target: '#main-content', // The target element to update
                    swap: 'innerHTML', // How to swap the content
                }).then(response => {
                    history.pushState({}, '', link);
                });
            });
        }
    } catch (error) {
        console.error('Failed to handlerRedirectOnClick', error);
    }
}

async function handlerHideNotif(Notifitems) {
    try {
        for (let item of Notifitems) {
            let hideBtn = item.getElementsByClassName('remove-notif')[0];
            hideBtn.addEventListener('click', async function (e) {
                e.preventDefault();
                item.classList.remove('active');
                item.classList.add('hide');
                item.addEventListener('animationend', function() {
                    item.remove();
                });
            });
        }
    } catch (error) {
        console.error('Failed to handlerHideNotif', error);
    }
}

// =============================== WS NOTIF ================================

async function connectWSNotif(roomName) {
    try {
        // const wsNotif = new WebSocket(`wss://${window.location.host}/ws/notif/${roomName}/`);
        return;
        wsNotif.onopen = function() {
            // console.log('wss Notif notif connected to ', roomName);
        };
        wsNotif.onmessage = function(e) {
            let data = JSON.parse(e.data);
            innerNotif(data);
        };

        wsNotif.onerror = function(e) {
            console.error('wssNotif notif error', e);
        };

        wsNotif.onclose = function(e) {
            // console.log('wssNotif notif closed');
        };

    } catch (error) {
        console.error('Failed to connectWSNotif', error);
    }
}

async function innerNotif(data) {
    try {
        let UUID_Tournament = data.UUID_Tournament;
        UUID_Tournament = UUID_Tournament.substring(0, 8);    
        let ID_Game = data.ID_Game;
        let link = data.link;

        let boxNotif = document.getElementById('notif-box');
        let notifItems = boxNotif.getElementsByClassName('notif-items');
        let notifItem = document.createElement('div');
        notifItem.classList.add('notif-items');
        notifItem.classList.add('active');
        notifItem.setAttribute('data-value', link);
        notifItem.innerHTML = `
            <i class="fas fa-times remove-notif"></i>
            <div class="redirect-notif">
                <div class="left-box">
                    <img src="https://d1tq3fcx54x7ou.cloudfront.net/uploads/store/tenant_161/download/366/image/large-041f064dd94c96b097973e5d41a9c45f.jpg" alt="tournament">
                </div>
                <div class="right-box">
                    <div class="head-notif">
                        <span>Tournament Notif</span>
                    </div>
                    <div class="body-notif">
                        <span>We look forward to seeing you at the ${UUID_Tournament} game of the ${ID_Game} tournament</span>
                    </div>
                </div>
            </div>
        `;
        boxNotif.appendChild(notifItem);
        handlerHideNotif(notifItems);
        handlerRedirectOnClick(notifItems);
    } catch (error) {
        console.error('Failed to innerNotif', error);
    }
}