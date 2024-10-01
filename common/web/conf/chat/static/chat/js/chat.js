
import MenusAppManager from "../../class/MenusAppManager.js";

async function loadMenus () {
    try {
        let user = await APIgetCurrentUser();
        let appManager = new MenusAppManager(user.id);
    } catch (error) {
        console.error('Failed to loadMenus', error);
    }
}


loadMenus();