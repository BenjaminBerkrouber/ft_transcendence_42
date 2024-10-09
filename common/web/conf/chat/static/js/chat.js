
import MenusAppManager from "./class/MenusAppManager.js";

/**
 * Loads the menus for the application by retrieving the current user and initializing the MenusAppManager.
 * 
 * This asynchronous function attempts to get the current user through the API and 
 * then creates a new instance of MenusAppManager using the user's ID.
 * If any errors occur during this process, they are logged to the console.
 * 
 * @async
 * @function loadMenus
 * @throws {Error} Logs an error to the console if loading menus fails.
 * 
 * @memberof SomeModule // Remplacez par le nom du module approprié où cette fonction est définie
 */
async function loadMenus () {
    try {
        let user = await APIgetCurrentUser();
        console.log(user);
        let appManager = new MenusAppManager(user.id);
    } catch (error) {
        console.error('Failed to loadMenus', error);
    }
}


loadMenus();