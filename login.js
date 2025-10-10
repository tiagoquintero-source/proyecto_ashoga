// Lógica para el formulario de inicio de sesión
document.addEventListener('DOMContentLoaded', function () {
	const form = document.getElementById('login-form');
 	const username = document.getElementById('username');
 	const password = document.getElementById('password');
 	const usernameError = document.getElementById('username-error');
 	const passwordError = document.getElementById('password-error');
 	const status = document.getElementById('status');

	// Validaciones simples
	function validate() {
		let ok = true;
		usernameError.textContent = '';
		passwordError.textContent = '';
		status.textContent = '';

		if (!username.value.trim()) {
			usernameError.textContent = 'Introduce tu nombre de usuario.';
			ok = false;
		}

		if (!password.value) {
			passwordError.textContent = 'Introduce tu contraseña.';
			ok = false;
		} else if (password.value.length < 4) {
			passwordError.textContent = 'La contraseña debe tener al menos 4 caracteres.';
			ok = false;
		}

		return ok;
	}

	// Simular envío y respuesta (aquí puedes integrar con backend)
	form.addEventListener('submit', function (e) {
		e.preventDefault();
		if (!validate()) return;

		// Estado: enviando
		status.textContent = 'Comprobando credenciales...';

		// Simulación asíncrona
		setTimeout(function () {
			// Ejemplo: credenciales de demo: usuario 'admin' y contraseña '1234'
			if (username.value.trim() === 'admin' && password.value === '1234') {
				status.textContent = 'Inicio de sesión correcto. Redirigiendo...';
				status.style.color = 'green';

				// Guardar sesión en localStorage
				const user = { username: username.value.trim(), logged: true, ts: Date.now() };
				localStorage.setItem('hotel_user', JSON.stringify(user));

				// Pequeña pausa para que el usuario vea el mensaje y luego redirigir al index
				setTimeout(function(){
					// Ir al index de menu_principal y usar replace para no permitir volver atrás
					// Ruta corregida: relativa a index.html en la raíz del proyecto
					window.location.replace('menu_principal/menu_principal.html');
				}, 400);
			} else {
				status.textContent = 'Usuario o contraseña incorrectos.';
				status.style.color = '#b91c1c';
			}
		}, 800);
	});
});
