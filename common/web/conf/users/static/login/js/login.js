class FormHandler {
	constructor() {
		this.loginForm = document.getElementById('login-form');
		this.registerForm = document.getElementById('register-form');
		this.events = [
			{
				btn: document.getElementById('login-submit'),
				form: this.loginForm,
				action: this.APILogin,
				errorBox: document.getElementById('error-login-value')
			},
			{
				btn: document.getElementById('register-submit'),
				form: this.registerForm,
				action: this.APIRegister,
				errorBox: document.getElementById('error-register-value')
			}
		];

		this.init();
	}

	/** 
	 * Initializes event handlers and form behaviors.
	 */
	init() {
		this.toggleSubmitForm();
		this.toggleChangeForm();
		this.toggle42Login();
		this.toggleShowPasswords();
		this.toggleFieldInputs();
	}


	// ===============================================================================================
	// ==================================== API Request Functions ====================================
	// ===============================================================================================


	/** 
	 * Sends an API request to log in a player.
	 * @param {FormData} formData - The form data to send.
	 * @returns {Promise} The API response.
	 */
	async APILogin(formData) {
		return this.apiRequest('/api/login_player/', formData);
	}

	/** 
	 * Sends an API request to register a player.
	 * @param {FormData} formData - The form data to send.
	 * @returns {Promise} The API response.
	 */
	async APIRegister(formData) {
		return this.apiRequest('/api/register_player/', formData);
	}

	/** 
	 * Performs an API request.
	 * @param {string} url - The API URL to call.
	 * @param {FormData} formData - The data to send in the request.
	 * @returns {Promise} The JSON response from the API.
	 */
	async apiRequest(url, formData) {
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'X-CSRFToken': this.getCookie('csrftoken'),
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams(formData),
			});
			if (!response.ok) {
				throw new Error('Network response was not ok ' + response.statusText);
			}
			return await response.json();
		} catch (error) {
			console.error('Request failed:', error);
			throw error;
		}
	}


	// ===============================================================================================
	// ================================== Form Submission Handling ===================================
	// ===============================================================================================


	/** 
	 * Toggles the submission of the login and registration forms.
	 */
	toggleSubmitForm() {
		this.events.forEach(event => {
			if (event.btn) {
				event.btn.addEventListener('click', async (e) => {
					e.preventDefault();
					const data = new FormData(event.form);
					try {
						const result = await event.action.call(this, data);
						this.handleResponse(result, event);
					} catch (error) {
						this.handleError(event.errorBox);
					}
				});
			}
		});
	}

	/** 
	 * Handles the response from the API request.
	 * @param {Object} result - The result returned by the API.
	 * @param {Object} event - The event data associated with the form submission.
	 */
	handleResponse(result, event) {
		const errorElement = event.form.querySelector('.error-messages');
		if (errorElement) {
			errorElement.innerHTML = '';
			errorElement.style.display = 'none';
		}
		if (result.success) {
			userIsAuthenticated = true;
			htmx.ajax('GET', result.redirect_url || '/', {
				target: '#main-content',
				swap: 'innerHTML',
			}, { once: true }).then(response => {
				history.pushState({}, '', result.redirect_url || '/');
			});
		} else {
			event.errorBox.innerHTML = 'Invalid credentials. Please try again.';
			event.errorBox.style.display = 'block';
		}
	}

	/** 
	 * Handles errors by displaying a message in the error box.
	 * @param {HTMLElement} errorBox - The element where error messages are displayed.
	 */
	handleError(errorBox) {
		errorBox.innerHTML = 'An unexpected error occurred. Please try again.';
		errorBox.style.display = 'block';
	}


	// ===============================================================================================
	// =================================== Form Toggle Functions =====================================
	// ===============================================================================================



	/** 
	 * Toggles between the login and registration forms.
	 */
	toggleChangeForm() {
		const events = [
			{
				btn: document.getElementById('login-btn'),
				forms: {
					show: this.loginForm,
					hide: this.registerForm
				},
				classAction: {
					add: 'login-btn',
					remove: 'register-btn'
				}
			},
			{
				btn: document.getElementById('register-btn'),
				forms: {
					show: this.registerForm,
					hide: this.loginForm
				},
				classAction: {
					add: 'register-btn',
					remove: 'login-btn'
				}
			}
		];

		events.forEach(event => {
			if (event.btn) {
				event.btn.addEventListener('click', () => {
					event.forms.show.style.display = 'block';
					event.forms.hide.style.display = 'none';
					document.getElementById(event.classAction.add).classList.add('active');
					document.getElementById(event.classAction.remove).classList.remove('active');
				});
			}
		});
	}

	/** 
	 * Initializes the 42 login button.
	 */
	toggle42Login() {
		const btn42 = document.getElementById('btn-42');
		if (!btn42) return;

		btn42.addEventListener('click', () => {
			const hostname = window.location.hostname;
			const redirectUri = `https://${hostname}:42424/api/register-42/`;
			const clientId = 'u-s4t2ud-74438314e8cff2be68aee7a119f4c95bff6ba35b11a2bf5c2627a31a869c9f28';
			const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
			window.location.href = authUrl;
		});
	}


	// ===============================================================================================
	// =================================== Input Field Management ====================================
	// ===============================================================================================


	/** 
	 * Toggles input field behaviors for validation.
	 */
	toggleFieldInputs() {
		const inputs = document.querySelectorAll('.warp-input input');
		inputs.forEach(input => {
			input.addEventListener('input', () => {
				this.checkIfInputIsFiled(input);
				if (input.type === 'email') {
					this.checkEmail(input);
				} else if (input.id === 'login-pass' || input.id === 'register-pass') {
					this.checkPassword(input);
				}
			});
		});
	}

	/** 
	 * Checks if an input field is filled and updates the label and valid indicator.
	 * @param {HTMLElement} input - The input element to check.
	 */
	async checkIfInputIsFiled(input) {
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
	}

	/** 
	 * Validates the email input and updates the valid indicator.
	 * @param {HTMLElement} input - The email input element.
	 */
	async checkEmail(input) {
		let validIndicator = input.parentElement.querySelector('.valid-indicator');
		if (this.validateEmail(input.value)) {
			validIndicator.innerHTML = '<i class="fa-solid fa-check-circle"></i>';
			validIndicator.classList.remove('invalid');
			validIndicator.classList.add('valid');
		} else {
			validIndicator.innerHTML = '<i class="fa-solid fa-times-circle"></i>';
			validIndicator.classList.remove('valid');
			validIndicator.classList.add('invalid');
		}
	}

	/** 
	 * Validates the password input and updates the valid indicator.
	 * @param {HTMLElement} input - The password input element.
	 */
	async checkPassword(input) {
		let validIndicator = input.parentElement.querySelector('.valid-indicator');
		if (this.validatePassword(input.value)) {
			validIndicator.innerHTML = '<i class="fa-solid fa-check-circle"></i>';
			validIndicator.classList.remove('invalid');
			validIndicator.classList.add('valid');
		} else {
			validIndicator.innerHTML = '<i class="fa-solid fa-times-circle"></i>';
			validIndicator.classList.remove('valid');
			validIndicator.classList.add('invalid');
		}
	}

	/** 
	 * Validates the email format.
	 * @param {string} email - The email string to validate.
	 * @returns {boolean} True if valid, false otherwise.
	 */
	validateEmail(email) {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(String(email).toLowerCase());
	}

	/** 
	 * Validates the password based on defined criteria.
	 * @param {string} password - The password string to validate.
	 * @returns {boolean} True if valid, false otherwise.
	 */
	validatePassword(password) {
		return password.length >= 8; // Example: validate minimum length
	}

	/** 
	 * Retrieves the CSRF token from cookies.
	 * @param {string} name - The name of the cookie to retrieve.
	 * @returns {string|null} The cookie value or null.
	 */
	getCookie(name) {
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


	// ===============================================================================================
	// ================================ Password Visibility Toggle ===================================
	// ===============================================================================================


	/** 
	 * Toggles visibility of passwords in input fields.
	 */
	toggleShowPasswords() {
		const passwordToggles = document.querySelectorAll('.toggle-password');
		passwordToggles.forEach(toggle => {
			toggle.addEventListener('click', (e) => {
				const passwordInput = e.target.previousElementSibling;
				passwordInput.type = (passwordInput.type === 'password') ? 'text' : 'password';
				e.target.classList.toggle('fa-eye');
				e.target.classList.toggle('fa-eye-slash');
			});
		});
	}
}

// Initialize the form handler
document.addEventListener('DOMContentLoaded', () => {
	new FormHandler();
});
