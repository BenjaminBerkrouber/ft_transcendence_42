import IFormHandler from '../../../class/IFormHandler.js';
import { APIRegisterUser } from '../../../class/API.js';

/**
 * FormRegister class.
 * 
 * This class extends the `IFormHandler` to manage the user registration form. 
 * It handles form submission and manages password visibility. The form data is sent 
 * to the API for user registration.
 * 
 * @class FormRegister
 * @extends IFormHandler
 * 
 * @memberof FormRegister
 */
class FormRegister extends IFormHandler {


	// ===============================================================================================
	// =========================================== Constructor =======================================
	// ===============================================================================================


	/**
     * FormRegister class constructor.
     * 
     * Initializes the form handler for the registration form by passing the form's ID, 
     * submit button's ID, error message container ID, and password toggle button IDs to 
     * the `IFormHandler` constructor.
     * 
     * @constructor
     * 
     * @memberof FormRegister
     */
	constructor() {
		super('register-form', 'register-submit', 'error-register-value', ['togglePasswordRegister'], '/profil/');
	}


	// ===============================================================================================
	// ============================================= Methods =========================================
	// ===============================================================================================


	/**
     * Handles the submission of the registration form.
     * 
     * This method is responsible for processing the form data and sending it to the 
     * registration API. It uses the `APIRegisterUser` function to register the user 
     * with the form data.
     * 
     * @async
     * @function submitAction
     * @param {FormData} formData - The form data object that contains the user's input for registration.
     * @returns {Promise<Object>} The result of the API call, which could either be a success or an error.
     * 
     * @throws {Error} - Throws an error if the API request fails or if the response is not valid.
     * 
     * @memberof FormRegister
     */
	async submitAction(formData) {
		return await APIRegisterUser(formData);
	}

}

export default FormRegister;