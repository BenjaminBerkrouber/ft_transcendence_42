import IFormHandler from '../../../class/IFormHandler.js';
import { APIudpateData } from '../../../class/API.js';

/**
 * FormUpdatePorfil class.
 * 
 * This class extends the `IFormHandler` to manage the user updateDataProfil form.
 * It handles form submission, and error display 
 * specific to the ProfilUpdate form. The form data is sent to the API for user authentication.
 * 
 * @class FormUpdatePorfil
 * @extends IFormHandler
 * 
 * @memberof FormUpdatePorfil
 */
class FormUpdatePorfil extends IFormHandler {


	// ===============================================================================================
	// =========================================== Constructor =======================================
	// ===============================================================================================


    /**
     * FormUpdatePorfil class constructor.
     * 
     * Initializes the form handler for the ProfilUpdate form by passing the form's ID, 
     * submit button's ID, error message container ID, and password toggle button IDs to 
     * the `IFormHandler` constructor.
     * 
     * @constructor
     * 
     * @memberof FormUpdatePorfil
     */
	constructor() {
		super('edit-form', 'submit-edit-data', 'error-content', [], null);
	}


	// ===============================================================================================
	// ============================================= Methods =========================================
	// ===============================================================================================

    /**
     * Handles the submission of the ProfilUpdate form.
     * 
     * This method is responsible for processing the form data and sending it to the 
     * ProfilUpdate API. It uses the `APIudpateData` function to authenticate the user with the 
     * provided ProfilUpdate credentials.
     * 
     * @async
     * @function submitAction
     * @param {FormData} formData - The form data object containing the user's input for ProfilUpdate.
     * @returns {Promise<Object>} The result of the API call, which could either be a success or an error.
     * 
     * @throws {Error} - Throws an error if the API request fails or if the response is not valid.
     * 
     * @memberof FormUpdatePorfil
     */
	async submitAction(formData) {
		return await APIudpateData(formData);
	}
}

export default FormUpdatePorfil;