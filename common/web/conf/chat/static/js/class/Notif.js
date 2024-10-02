/**
 * Notif class.
 * 
 * This class manages user notifications, including chat and social notifications. It retrieves 
 * notification data from an API, updates the notification counts, and manages the display 
 * of notification menus and indicators within the application.
 * 
 * @class Notif
 * 
 * @property {string} userId - The unique identifier for the user.
 * @property {Array} globalNotif - A list of global notifications for the user.
 * @property {number} nbrChatNotif - The number of chat notifications for the user.
 * @property {number} nbrSocialNotif - The number of social notifications for the user.
 * 
 * @memberof Notif
 */
class Notif {


	// ===============================================================================================
	// =========================================== Constructor =======================================
	// ===============================================================================================


	/**
	 * Notif class constructor.
	 * 
	 * This constructor initializes a Notif instance for managing notifications related to the user.
	 * It sets up the user ID and initializes notification counters for chat and social notifications.
	 * 
	 * @param {string} userId - The unique identifier for the user, used to fetch user-specific notifications.
	 * 
	 * @property {string} userId - The unique identifier for the user.
	 * @property {Array|null} globalNotif - A list of global notifications for the user, initialized as null.
	 * @property {number} nbrChatNotif - The number of chat notifications for the user, initialized to 0.
	 * @property {number} nbrSocialNotif - The number of social notifications for the user, initialized to 0.
	 * 
	 * @memberof Notif
	 */
	constructor(userId) {
		this.userId = userId;
		this.globalNotif = null;
		this.nbrChatNotif = 0;
		this.nbrSocialNotif = 0;
	}


	// ===============================================================================================
	// ============================================= INIT ============================================
	// ===============================================================================================


	/**
	 * Initializes the Notif instance.
	 * 
	 * This method fetches and updates all notifications for the user by calling the relevant API methods.
	 * 
	 * @async
	 * @function init
	 * 
	 * @throws {Error} Logs an error if updating notifications fails.
	 * 
	 * @memberof Notif
	 */
	async init() {
		await this.updateAllNotif();
		setInterval( async () => {
			await this.updateAllNotif();
			if (document.getElementById('radial-menu').classList.contains('active'))
				this.disableNotifSubMenus();
			else
				this.disableNotifMenus();
		}, 10000);
	}


	// ===============================================================================================
	// ======================================= Update Element ========================================
	// ===============================================================================================


	/**
	 * Updates all notification counts for the user.
	 * 
	 * This method fetches the global notifications and counts for chat and social notifications
	 * by calling the respective API methods.
	 * 
	 * @async
	 * @function updateAllNotif
	 * 
	 * @throws {Error} Logs an error if fetching notifications fails.
	 * 
	 * @memberof Notif
	 */
	async updateAllNotif() {
		try {
			this.globalNotif = await APIgetGlobalNotif(this.userId);
			this.nbrChatNotif = await APIgetNbrChatNotif(this.userId);
			this.nbrSocialNotif = await APIgetNbrSocialNotif(this.userId);
		} catch (error) {
			console.error('Failed to updateAllNotif', error);
		}
	}


	// ===============================================================================================
	// ======================================= Display Element =======================================
	// ===============================================================================================


	/**
	 * Displays the chat notification count in the menu.
	 * 
	 * This method updates the chat notification counter in the menu if there are any chat notifications.
	 * It also activates the chat notification menu.
	 * 
	 * @async
	 * @function displayNotifMenusChat
	 * 
	 * @throws {Error} Logs an error if displaying chat notifications fails.
	 * 
	 * @memberof Notif
	 */
	async displayNotifMenusChat() {
		try {
			if (this.nbrChatNotif == 0) {
				let notifChatBox = document.getElementById('notif-chat');
				notifChatBox.classList.remove('active');
				notifChatBox.innerHTML = '';
				return;
			}
			let notifChatCpt = document.getElementById('notif-chat-cpt');
			if (!notifChatCpt) return;
			notifChatCpt.innerHTML = this.nbrChatNotif;
			let notifChatBox = document.getElementById('notif-chat');
			notifChatBox.classList.add('active');
		} catch (error) {
			console.error('Failed to displayNotifMenusChat', error);
		}
	}


	/**
	 * Displays the social notification count in the menu.
	 * 
	 * This method updates the social notification counter in the menu if there are any social notifications.
	 * It also activates the social notification menu.
	 * 
	 * @async
	 * @function displayNotifMenusSocial
	 * 
	 * @throws {Error} Logs an error if displaying social notifications fails.
	 * 
	 * @memberof Notif
	 */
	async displayNotifMenusSocial() {
		try {
			if (this.nbrSocialNotif == 0) {
				let notifSocialBox = document.getElementById('notif-social');
				notifSocialBox.classList.remove('active');
				notifSocialBox.innerHTML = '';
				return;
			}
			let notifSocialtCpt = document.getElementById('notif-social-cpt');
			if (!notifSocialtCpt) return;
			notifSocialtCpt.innerHTML = this.nbrSocialNotif;
			let notifChatBox = document.getElementById('notif-social');
			notifChatBox.classList.add('active');
		} catch (error) {
			console.error('Failed to displayNotifMenusSocial', error);
		}
	}

	/**
	 * Disables the notification indicators for submenus.
	 * 
	 * This method updates the display of chat and social notifications based on their counts.
	 * 
	 * @async
	 * @function disableNotifSubMenus
	 * 
	 * @throws {Error} Logs an error if disabling notification submenus fails.
	 * 
	 * @memberof Notif
	 */
	async disableNotifSubMenus() {
		try {
			this.displayNotifMenusChat();
			this.displayNotifMenusSocial();
		} catch (error) {
			console.error('Failed to disableNotifSubMenus', error);
		}
	}

	/**
	 * Disables the global notification menu.
	 * 
	 * This method updates the global notification count and activates the global notification menu
	 * if there are any global notifications.
	 * 
	 * @async
	 * @function disableNotifMenus
	 * 
	 * @throws {Error} Logs an error if disabling the global notification menu fails.
	 * 
	 * @memberof Notif
	 */
	async disableNotifMenus() {
		try {
			if (this.globalNotif == 0)
				return;
			let boxNbrNotif = document.getElementById('gl-notif-nbr');
			if (!boxNbrNotif) return;
			boxNbrNotif.innerHTML = this.globalNotif.length;
			let boxGlobalNotif = document.getElementById('global-notif');
			boxGlobalNotif.classList.add('active');
		} catch (error) {
			console.error('Failed to disableNotifMenus', error);
		}
	}


	// ===============================================================================================
	// ======================================= Hide Element =======================================
	// ===============================================================================================


	/**
	 * Hides the chat notification menu.
	 * 
	 * This method removes the active class from the chat notification menu, effectively hiding it.
	 * 
	 * @async
	 * @function hideNotifMenusChat
	 * 
	 * @throws {Error} Logs an error if hiding the chat notification menu fails.
	 * 
	 * @memberof Notif
	 */
	async hideNotifMenusChat() {
		try {
			let notifChatBox = document.getElementById('notif-chat');
			notifChatBox.classList.remove('active');
		} catch (error) {
			console.error('Failed to hideNotifMenusChat', error);
		}
	}

	/**
	 * Hides the social notification menu.
	 * 
	 * This method removes the active class from the social notification menu, effectively hiding it.
	 * 
	 * @async
	 * @function hideNotifMenusSocial
	 * 
	 * @throws {Error} Logs an error if hiding the social notification menu fails.
	 * 
	 * @memberof Notif
	 */
	async hideNotifMenusSocial() {
		try {
			let notifSocialBox = document.getElementById('notif-social');
			notifSocialBox.classList.remove('active');
		} catch (error) {
			console.error('Failed to hideNotifMenusSocial', error);
		}
	}

	/**
	 * Hides the global notification menu.
	 * 
	 * This method removes the active class from the global notification menu, effectively hiding it.
	 * 
	 * @async
	 * @function hideNotifMenus
	 * 
	 * @throws {Error} Logs an error if hiding the global notification menu fails.
	 * 
	 * @memberof Notif
	 */
	async hideNotifMenus() {
		try {
			let boxGlobalNotif = document.getElementById('global-notif');
			boxGlobalNotif.classList.remove('active');
		} catch (error) {
			console.error('Failed to hideNotifMenus', error);
		}
	}

	/**
	 * Hides the chat and social notification submenus.
	 * 
	 * This method removes the active class from the chat and social notification submenus, effectively hiding them.
	 * 
	 * @async
	 * @function hideNotifSubMenus
	 * 
	 * @throws {Error} Logs an error if hiding the notification submenus fails.
	 * 
	 * @memberof Notif
	 */
	async hideNotifSubMenus() {
		try {
			let notifChatBox = document.getElementById('notif-chat');
			notifChatBox.classList.remove('active');
			let notifSocialBox = document.getElementById('notif-social');
			notifSocialBox.classList.remove('active');
		} catch (error) {
			console.error('Failed to hideNotifSubMenus', error);
		}
	}

}

export default Notif;