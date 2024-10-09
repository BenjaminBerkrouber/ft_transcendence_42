/**
 * IFormHandler class.
 * 
 * This class handles the forms, managing submission, error handling, 
 * and specific field displays such as password fields. It also includes functionality
 * for validating user input fields.
 * 
 * @class IFormHandler
 * 
 * @property {HTMLElement} form - The HTML form element corresponding to the provided ID.
 * @property {HTMLElement} submitBtn - The form's submit button.
 * @property {HTMLElement} errorBox - An HTML element used to display error messages.
 * @property {Array} passwordToggles - An array of IDs for elements that toggle password visibility.
 * 
 * @memberof IFormHandler
 */
class IFormHandler {


	// ===============================================================================================
	// =========================================== Constructor =======================================
	// ===============================================================================================


    /**
     * IFormHandler class constructor.
     * 
     * Initializes the form, submit button, and error box properties. 
     * Then calls the initialization methods for handling various form interactions.
     * 
	 * @constructor
     * @param {string} formId - The HTML form's ID.
     * @param {string} submitBtnId - The ID of the submit button.
     * @param {string} errorBoxId - The ID of the error message box.
     * @param {Array} passwordToggleIds - An array of IDs for elements that toggle password visibility.
	 * 
	 * @property {HTMLElement} form - The HTML form element corresponding to the provided ID.
	 * @property {HTMLElement} submitBtn - The form's submit button.
	 * @property {HTMLElement} errorBox - An HTML element used to display error messages.
	 * @property {Array} passwordToggles - An array of IDs for elements that toggle password visibility.
	 * 
	 * @memberof IFormHandler
     */
	constructor(formId, submitBtnId, errorBoxId, passwordToggleIds, redirect) {
		this.form = document.getElementById(formId);
		this.submitBtn = document.getElementById(submitBtnId);
		this.errorBox = document.getElementById(errorBoxId);
		this.passwordToggles = passwordToggleIds;
		this.redirect = redirect;
		this.init();
	}


	// ===============================================================================================
	// ============================================= INIT ============================================
	// ===============================================================================================


	/**
	 * Initializes the form handler.
	 * 
	 * Calls methods to handle form submission, toggle password visibility,
	 * and manage input fields.
	 * 
	 * @function init
	 * 
	 * @throws {Error} - An error if the form element is not found.
	 * 
	 * @memberof IFormHandler
	 */
	init() {
		this.handlerSubmitForm();
		this.toggleShowPasswords();
		this.toggleFieldInputs();
	}


	// ===============================================================================================
	// ======================================== handle Element =======================================
	// ===============================================================================================


	/**
	 * Handles form submission.
	 * 
	 * This method listens for the submit button click event and prevents the default
	 * form submission. It then collects the form data and calls the submitAction method.
	 * 
	 * @async
	 * @function handlerSubmitForm
	 * 
	 * @throws {Error} - An error if the form or submit button is not found.
	 * 
	 * @memberof IFormHandler
	 */
	async handlerSubmitForm() {
		try {
			if (!this.submitBtn) throw new Error('Submit button not found.');
			this.submitBtn.addEventListener('click', async (e) => {
				e.preventDefault();
				if (!this.allInputIsFilled()) {
					if (!this.errorBox) throw new Error('Error box not found.');
					this.errorBox.innerHTML = 'Please fill in all fields.';
					this.errorBox.style.display = 'block';
					return;
				}
				const data = new FormData(this.form);
				try {
					const result = await this.submitAction(data);
					this.handleResponse(result);
				} catch (error) {
					this.handleError();
				}
			});
		} catch (error) {
			throw new Error('Form or submit button not found.', error);
		}
	}

	/**
	 * Handles API response.
	 * 
	 * This method handles the response from the API after form submission.
	 * It checks if the response is successful and updates the UI accordingly.
	 * 
	 * @async
	 * @function handleResponse
	 * @param {Object} result - The response object from the API.
	 * 
	 * @throws {Error} - An error if the response object is not valid.
	 * 
	 * @memberof IFormHandler
	 */
	async handleResponse(result) {
		try {
			if (result.success) {
				if (result.error && this.errorBox) {
					this.errorBox.innerHTML = result.error;
					if (result.content) {
						let event = new CustomEvent("contentUpdated", { detail: {message: result.content}, bubbles: true, cancelable: true });
						this.errorBox.dispatchEvent(event);
					}
				}
				// redirect with SPA // A FAIRE
				if (this.redirect)
					window.location.href = this.redirect;
			} else {
				if (!this.errorBox) throw new Error('Error box not found.');
				this.errorBox.innerHTML = result.error;
				this.errorBox.style.display = 'block';
			}
		} catch (error) {
			console.error('Error handling response:', error);
			throw new Error('Error handling response.', error);
		}
	}

	/**
	 * Handles API errors.
	 * 
	 * This method displays an error message when an API request fails.
	 * 
	 * @function handleError
	 * 
	 * @throws {Error} - An error if the error box is not found.
	 * 
	 * @memberof IFormHandler
	 */
	handleError() {
		if (!this.errorBox)
			throw new Error('Error box not found.');
		this.errorBox.innerHTML = 'An unexpected error has occurred. Please try again.';
		this.errorBox.style.display = 'block';
	}


	// ===============================================================================================
	// ======================================= Toggle Element ========================================
	// ===============================================================================================


	/**
	 * Adds an event listener to the password visibility toggle buttons.
	 * 
	 * When the user clicks on a password toggle button, this function switches the input 
	 * field between 'password' and 'text' types, showing or hiding the password. It also 
	 * updates the toggle icon accordingly (e.g., showing an "eye" icon for visibility and 
	 * an "eye-slash" icon for hiding).
	 * 
	 * @function toggleShowPasswords
	 * 
	 * @throws {Error} - An error if the password toggle element is not found.
	 * 
	 * @memberof IFormHandler
	 */
	toggleShowPasswords() {
		try {
			if (this.passwordToggles && this.passwordToggles.length > 0) {
				this.passwordToggles.forEach(toggleId => {
					const toggle = document.getElementById(toggleId);
					if (!toggle) return;
					toggle.addEventListener('click', () => {
						const icon = toggle.querySelector('i');
						const input = toggle.parentElement.querySelector('input');
						if (!input) return;
						input.type = (input.type === 'password') ? 'text' : 'password';
						icon.classList.toggle('fa-eye');
						icon.classList.toggle('fa-eye-slash');
					});
				});
			}
		} catch (error) {
			console.error('Error toggling password visibility.', error);
		}
	}

	/**
	 * Monitors input fields and manages the validation state.
	 * 
	 * This function adds event listeners to all input fields within the form and 
	 * checks if they are filled, validating specific fields like email and password 
	 * by calling `checkEmail` and `checkPassword` methods. It provides real-time feedback 
	 * to users while they input data.
	 * 
	 * @function toggleFieldInputs
	 * 
	 * @throws {Error} - An error if the input field element is not found.
	 * 
	 * @memberof IFormHandler
	 */
	toggleFieldInputs() {
		try {
			const inputs = document.querySelectorAll('.warp-input input');
			inputs.forEach(input => {
				input.addEventListener('input', () => {
					this.checkIfInputIsFiled(input);
					if (input.type === 'email') {
						this.checkEmail(input);
					} else if (input.id.endsWith('pass')) {
						this.checkPassword(input);
					}
				});
			});
		} catch (error) {
			console.error('Error toggling field inputs.', error);
		}
	}


	// ===============================================================================================
	// ============================================ Checker ==========================================
	// ===============================================================================================


	/**
	 * Checks if an input field is filled and updates its label and validation indicator accordingly.
	 * 
	 * When the user starts typing in an input field, this function checks if the field contains any value.
	 * If filled, it marks the label as "active" and displays a visual indicator (e.g., a checkmark).
	 * Otherwise, it resets the label and hides the indicator.
	 * 
	 * @function checkIfInputIsFiled
	 * @param {HTMLInputElement} input - The input field being checked.
	 * 
	 * @throws {Error} - An error if the input field element is not found.
	 * 
	 * @memberof IFormHandler
	 */
	checkIfInputIsFiled(input) {
		try {
			let label = input.nextElementSibling;
			if (!label) return;
			let validIndicator = input.parentElement.querySelector('.valid-indicator');
			if (!validIndicator) return;
			if (input.value) {
				label.classList.add('filled');
				validIndicator.style.opacity = '1';
			} else {
				label.classList.remove('filled');
				validIndicator.style.opacity = '0';
			}
		} catch (error) {
			console.error('Error checking input field.', error);
		}
	}

	/**
	 * Validates the format of the email field in real-time.
	 * 
	 * This function checks if the email address provided in the input field follows the correct format 
	 * (e.g., "example@domain.com"). If valid, it displays a success icon in the validation indicator. 
	 * Otherwise, it displays an error icon.
	 * 
	 * @function checkEmail
	 * @param {HTMLInputElement} input - The email input field to validate.
	 * 
	 * @throws {Error} - An error if the input field element is not found.
	 * 
	 * @memberof IFormHandler
	 */
	checkEmail(input) {
		try {
			let validIndicator = input.parentElement.querySelector('.valid-indicator');
			if (!validIndicator) return;
			if (this.isValidateEmail(input.value)) {
				validIndicator.innerHTML = '<i class="fa-solid fa-check-circle"></i>';
				validIndicator.classList.remove('invalid');
				validIndicator.classList.add('valid');
			} else {
				validIndicator.innerHTML = '<i class="fa-solid fa-times-circle"></i>';
				validIndicator.classList.remove('valid');
				validIndicator.classList.add('invalid');
			}
		} catch (error) {
			console.error('Error checking email field.', error);
		}
	}

	/**
	 * Validates the strength of the password field in real-time.
	 * 
	 * This function checks if the password provided meets the defined criteria (e.g., at least 8 characters,
	 * containing at least one uppercase letter, one lowercase letter, and one digit). If valid, it displays a 
	 * success icon in the validation indicator. Otherwise, it displays an error icon.
	 * 
	 * @function checkPassword
	 * @param {HTMLInputElement} input - The password input field to validate.
	 * 
	 * @throws {Error} - An error if the input field element is not found.
	 * 
	 * @memberof IFormHandler
	 */
	checkPassword(input) {
		try {
			let validIndicator = input.parentElement.querySelector('.valid-indicator');
			if (!validIndicator) return;
			if (this.isValidatePassword(input.value)) {
				validIndicator.innerHTML = '<i class="fa-solid fa-check-circle"></i>';
				validIndicator.classList.remove('invalid');
				validIndicator.classList.add('valid');
			} else {
				validIndicator.innerHTML = '<i class="fa-solid fa-times-circle"></i>';
				validIndicator.classList.remove('valid');
				validIndicator.classList.add('invalid');
			}
		} catch (error) {
			console.error('Error checking password field.', error);
		}
	}


	// ===============================================================================================
	// ============================================== Utils ==========================================
	// ===============================================================================================


	/**
	 * Validates if the provided email address follows a valid format.
	 * 
	 * The method uses a regular expression to validate the structure of the email, 
	 * ensuring it contains the required characters and format (e.g., "example@domain.com").
	 * 
	 * @function isValidateEmail
	 * @param {string} email - The email address string to validate.
	 * @returns {boolean} True if the email is valid, false otherwise.
	 * 
	 * @memberof IFormHandler
	 */
	isValidateEmail(email) {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(String(email).toLowerCase());
	}

	/**
	 * Validates if the provided password meets the defined strength criteria.
	 * 
	 * The password must contain at least 8 characters, with at least one uppercase letter, 
	 * one lowercase letter, and one digit.
	 * 
	 * @function isValidatePassword
	 * @param {string} password - The password string to validate.
	 * @returns {boolean} True if the password meets the validation criteria, false otherwise.
	 * 
	 * @memberof IFormHandler
	 */
	isValidatePassword(password) {
		const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
		return re.test(password);
	}

	/**
	 * Checks if all input fields are filled.
	 * 
	 * This method checks if all input fields within the form are filled,
	 * 
	 * @function allInputIsFilled
	 * @returns {boolean} True if all input fields are filled, false otherwise.
	 * 
	 * @memberof IFormHandler
	 */
	allInputIsFilled() {
		try {
			let inputs = this.form.querySelectorAll('input');
			for (let i = 0; i < inputs.length; i++) {
				if (!inputs[i].value) {
					return false;
				}
			}
			return true;
		} catch (error) {
			console.error('Error checking input field.', error);
		}
	}

}

export default IFormHandler;