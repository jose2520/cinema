// Importa funciones para guardar sesión, navegar, autenticar y mostrar notificaciones
import { saveSession } from "@/utils";
import { navigateTo } from "@/router/router";
import { loginUser } from "@/services/auth.service";
import { showToast } from "@/components/Toast";

// Vista de formulario de inicio de sesión con soporte para "Recordar sesión"
export default function loginView() {
  return `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-indigo-600 dark:text-indigo-400">CineReserve</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-2">Sistema de gestión de reservas</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 class="text-2xl font-bold mb-6">Iniciar sesión</h2>

          <form id="loginForm">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo electrónico</label>
              <input type="email" name="email" placeholder="correo@ejemplo.com"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
              <input type="password" name="password" placeholder="••••••••"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
            </div>

            <div class="flex items-center gap-2 mb-6">
              <input type="checkbox" id="rememberMe" name="remember" checked
                class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
              <label for="rememberMe" class="text-sm text-gray-600 dark:text-gray-400">Recordar sesión</label>
            </div>

            <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
              Ingresar
            </button>
          </form>

          <div id="loginError" class="mt-4 hidden"></div>

          <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            ¿No tienes cuenta?
            <a href="/register" data-nav="register" class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Regístrate</a>
          </p>

          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">Credenciales de prueba</p>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <p class="font-medium">Admin</p>
                <p class="text-gray-500">admin@test.com</p>
                <p class="text-gray-500">A123456</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <p class="font-medium">Usuario</p>
                <p class="text-gray-500">user@test.com</p>
                <p class="text-gray-500">A123456</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Inicializa los eventos del formulario de login: validación, autenticación y navegación
loginView._init = () => {
  const form = document.querySelector("#loginForm");
  const errorDiv = document.querySelector("#loginError");

  // Maneja el envío del formulario de inicio de sesión
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorDiv.classList.add("hidden");

    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const remember = form.remember?.checked ?? true;

    // Validación de campos vacíos
    if (!email || !password) {
      errorDiv.textContent = "Todos los campos son obligatorios";
      errorDiv.classList.remove("hidden");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Ingresando...";

    try {
      const user = await loginUser(email, password);
      saveSession(user, remember);
      showToast(`Bienvenido, ${user.name}`, "success");
      navigateTo("home");
    } catch (error) {
      errorDiv.textContent = error.message || "Error al conectar con el servidor";
      errorDiv.className = "mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm";
      submitBtn.disabled = false;
      submitBtn.textContent = "Ingresar";
    }
  });

};
