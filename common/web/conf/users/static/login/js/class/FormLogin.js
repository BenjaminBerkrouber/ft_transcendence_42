import IFormHandler from '../../../class/IFormHandler.js';
import { APILoginUser } from '../../../class/API.js';

/**
 * FormLogin class.
 * 
 * This class extends the `IFormHandler` to manage the user login form.
 * It handles form submission, password visibility toggling, and error display 
 * specific to the login form. The form data is sent to the API for user authentication.
 * 
 * @class FormLogin
 * @extends IFormHandler
 * 
 * @memberof FormLogin
 */
class FormLogin extends IFormHandler {


	// ===============================================================================================
	// =========================================== Constructor =======================================
	// ===============================================================================================


    /**
     * FormLogin class constructor.
     * 
     * Initializes the form handler for the login form by passing the form's ID, 
     * submit button's ID, error message container ID, and password toggle button IDs to 
     * the `IFormHandler` constructor.
     * 
     * @constructor
     * 
     * @memberof FormLogin
     */
	constructor() {
		super('login-form', 'login-submit', 'error-login-value', ['togglePasswordLogin'], '/profil/');
	}


	// ===============================================================================================
	// ============================================= Methods =========================================
	// ===============================================================================================

    /**
     * Handles the submission of the login form.
     * 
     * This method is responsible for processing the form data and sending it to the 
     * login API. It uses the `APILoginUser` function to authenticate the user with the 
     * provided login credentials.
     * 
     * @async
     * @function submitAction
     * @param {FormData} formData - The form data object containing the user's input for login.
     * @returns {Promise<Object>} The result of the API call, which could either be a success or an error.
     * 
     * @throws {Error} - Throws an error if the API request fails or if the response is not valid.
     * 
     * @memberof FormLogin
     */
	async submitAction(formData) {
		return await APILoginUser(formData);
	}
}

export default FormLogin;