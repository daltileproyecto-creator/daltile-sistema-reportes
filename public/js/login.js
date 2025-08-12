document.getElementById('login-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const codigo = document.getElementById('code').value.trim();
  const password = document.getElementById('password').value.trim();
  const message = document.getElementById('error-message');

  message.textContent = '';
  message.className = 'message'; // Reinicia clases

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ codigo, password })
    });

    if (response.redirected) {
      window.location.href = response.url;
    } else {
      message.textContent = '❌ Código o contraseña incorrectos.';
      message.classList.add('error');
    }
  } catch (error) {
    console.error('❌ Error en el login:', error);
    message.textContent = '❌ Error de red. Intenta de nuevo.';
    message.classList.add('error');
  }
});
