import { saveSession } from "@/utils";
import { navigateTo } from "@/router/router";
import { loginUser } from "@/services/auth.service";
import { showToast } from "@/components/Toast";
import { createParticles } from "@/utils/canvas";

export default function loginView() {
  return `
    <div class="min-h-screen flex">
      <div class="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 items-center justify-center overflow-hidden">
        <canvas id="loginCanvas" class="absolute inset-0 w-full h-full"></canvas>
        <div class="relative z-10 text-center px-12">
          <div class="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center animate-float">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/></svg>
          </div>
          <h1 class="text-4xl font-bold text-white mb-3">CineReserve</h1>
          <p class="text-indigo-100 text-lg">Sistema de gestión de reservas de cine</p>
          <div class="mt-8 flex justify-center gap-2">
            <span class="w-2 h-2 rounded-full bg-white/60 animate-glow-pulse" style="animation-delay:0s"></span>
            <span class="w-2 h-2 rounded-full bg-white/60 animate-glow-pulse" style="animation-delay:0.5s"></span>
            <span class="w-2 h-2 rounded-full bg-white/60 animate-glow-pulse" style="animation-delay:1s"></span>
          </div>
        </div>
      </div>

      <div class="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white dark:bg-gray-900">
        <div class="w-full max-w-sm">
          <div class="lg:hidden text-center mb-8">
            <h1 class="text-3xl font-bold gradient-text">CineReserve</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">Sistema de gestión de reservas</p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 class="text-xl font-bold mb-1">Iniciar sesión</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Ingresa tus credenciales para continuar</p>

            <form id="loginForm" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Correo electrónico</label>
                <input type="email" name="email" placeholder="correo@ejemplo.com" autocomplete="email"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contraseña</label>
                <input type="password" name="password" placeholder="••••••••" autocomplete="current-password"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all">
              </div>

              <div class="flex items-center gap-2">
                <input type="checkbox" id="rememberMe" name="remember" checked
                  class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <label for="rememberMe" class="text-sm text-gray-600 dark:text-gray-400">Recordar sesión</label>
              </div>

              <button type="submit" class="btn-shine w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]">
                Ingresar
              </button>
            </form>

            <div id="loginError" class="mt-4 hidden"></div>

            <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              ¿No tienes cuenta?
              <a href="/register" data-nav="register" class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Regístrate</a>
            </p>

            <div class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <p class="text-xs text-gray-400 text-center mb-3">Credenciales de prueba</p>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                  <p class="font-semibold text-indigo-600 dark:text-indigo-400">Admin</p>
                  <p class="text-gray-500 mt-0.5">admin@test.com</p>
                  <p class="text-gray-400">A123456</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                  <p class="font-semibold text-indigo-600 dark:text-indigo-400">Usuario</p>
                  <p class="text-gray-500 mt-0.5">user@test.com</p>
                  <p class="text-gray-400">A123456</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

loginView._init = () => {
  const canvas = document.querySelector("#loginCanvas");
  let cleanup;
  if (canvas) {
    cleanup = createParticles(canvas, { count: 50, color: "255, 255, 255", minSize: 1, maxSize: 3, speed: 0.2, connectDist: 100 });
  }

  const form = document.querySelector("#loginForm");
  const errorDiv = document.querySelector("#loginError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorDiv.classList.add("hidden");

    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const remember = form.remember?.checked ?? true;

    if (!email || !password) {
      errorDiv.textContent = "Todos los campos son obligatorios";
      errorDiv.className = "mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm";
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<svg class="animate-spin w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>';

    try {
      const user = await loginUser(email, password);
      saveSession(user, remember);
      showToast(`Bienvenido, ${user.name}`, "success");
      navigateTo("home");
    } catch (error) {
      errorDiv.textContent = error.message || "Error al conectar con el servidor";
      errorDiv.className = "mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm";
      submitBtn.disabled = false;
      submitBtn.textContent = "Ingresar";
    }
  });
};
