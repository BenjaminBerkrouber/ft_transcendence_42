import FormLogin from "./class/FormLogin.js";
import FormRegister from "./class/FormRegister.js";


	// ===============================================================================================
	// ============================================ Event ============================================
	// ===============================================================================================


document.addEventListener('DOMContentLoaded', () => {
	new FormLogin();
	new FormRegister();
	handler42Login();
	handlerChangeForm();
});


	// ===============================================================================================
	// ======================================== handle Element =======================================
	// ===============================================================================================


/**
 * Initializes event listeners for login with 42 API OAuth.
 * 
 * This function sets up the event listener for the "Login with 42" button. 
 * When clicked, it redirects the user to the 42 API OAuth authorization endpoint.
 * The client ID and redirect URI are configured for authentication.
 * 
 * @async
 * @function handler42Login
 * 
 * @throws {Error} Throws an error if the button with ID `btn-42` is not found in the DOM.
 */
async function handler42Login() {
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

/**
 * handlers between the login and register forms.
 * 
 * This function manages the display of login and registration forms. When one button 
 * is clicked (either "login" or "register"), the corresponding form is displayed while 
 * the other is hidden. It also updates the active state of the buttons by adding or 
 * removing CSS classes.
 * 
 * @async
 * @function handlerChangeForm
 * 
 * @throws {Error} Throws an error if any of the form elements or buttons are not found in the DOM.
 */
async function handlerChangeForm() {
	const events = [
		{
			btn: document.getElementById('login-btn'),
			forms: {
				show: document.getElementById('login-form'),
				hide: document.getElementById('register-form')
			},
			classAction: {
				add: 'login-btn',
				remove: 'register-btn'
			}
		},
		{
			btn: document.getElementById('register-btn'),
			forms: {
				show: document.getElementById('register-form'),
				hide: document.getElementById('login-form')
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