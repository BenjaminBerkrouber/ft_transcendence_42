import IFormHandler from '../../../class/IFormHandler.js';
import { APIupdatePassword } from '../../../class/API.js';

/**
 * FormUpdatePassword class.
 * 
 * This class extends the `IFormHandler` to manage the user updateDataProfil form.
 * It handles form submission, and error display 
 * specific to the PasswordUpdate form. The form data is sent to the API for user authentication.
 * 
 * @class FormUpdatePassword
 * @extends IFormHandler
 * 
 * @memberof FormUpdatePassword
 */
class FormUpdatePassword extends IFormHandler {


	// ===============================================================================================
	// =========================================== Constructor =======================================
	// ===============================================================================================


    /**
     * FormUpdatePassword class constructor.
     * 
     * Initializes the form handler for the PasswordUpdate form by passing the form's ID, 
     * submit button's ID, error message container ID, and password toggle button IDs to 
     * the `IFormHandler` constructor.
     * 
     * @constructor
     * 
     * @memberof FormUpdatePassword
     */
	constructor() {
		super('edit-password-form', 'submit-edit-password', 'error-content-pass', ['toggle-old-password', 'toggle-new-password', 'toggle-confirm-password'], null);
	}


	// ===============================================================================================
	// ============================================= Methods =========================================
	// ===============================================================================================

    /**
     * Handles the submission of the PasswordUpdate form.
     * 
     * This method is responsible for processing the form data and sending it to the 
     * PasswordUpdate API. It uses the `APIupdatePassword` function to authenticate the user with the 
     * provided PasswordUpdate credentials.
     * 
     * @async
     * @function submitAction
     * @param {FormData} formData - The form data object containing the user's input for PasswordUpdate.
     * @returns {Promise<Object>} The result of the API call, which could either be a success or an error.
     * 
     * @throws {Error} - Throws an error if the API request fails or if the response is not valid.
     * 
     * @memberof FormUpdatePassword
     */
	async submitAction(formData) {
		return await APIupdatePassword(formData);
	}
}

export default FormUpdatePassword;