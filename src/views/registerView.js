import { navigateTo } from "@/router/router";
import { showToast } from "@/components/Toast";
import { getUsersByEmail, registerUser } from "@/services/auth.service";
import { createParticles } from "@/utils/canvas";

export default function registerView() {
  return `
    <div class="min-h-screen flex">
      <div class="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 items-center justify-center overflow-hidden">
        <canvas id="registerCanvas" class="absolute inset-0 w-full h-full"></canvas>
        <div class="relative z-10 text-center px-12">
          <div class="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center animate-float">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
          </div>
          <h1 class="text-4xl font-bold text-white mb-3">Únete a CineReserve</h1>
          <p class="text-indigo-100 text-lg">Crea tu cuenta y disfruta del cine</p>
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
            <p class="text-gray-500 dark:text-gray-400 mt-1">Crear una cuenta nueva</p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 class="text-xl font-bold mb-1">Registro</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Completa tus datos para registrarte</p>

            <form id="registerForm" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nombre completo</label>
                <input type="text" name="name" placeholder="Tu nombre" required
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Correo electrónico</label>
                <input type="email" name="email" placeholder="correo@ejemplo.com" required
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contraseña</label>
                <input type="password" name="password" placeholder="Mínimo 6 caracteres" required minlength="6"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirmar contraseña</label>
                <input type="password" name="confirmPassword" placeholder="Repite la contraseña" required
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all">
              </div>

              <button type="submit" class="btn-shine w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]">
                Crear cuenta
              </button>
            </form>

            <div id="registerError" class="mt-4 hidden"></div>

            <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              ¿Ya tienes cuenta?
              <a href="/login" data-nav="login" class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Inicia sesión</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

registerView._init = () => {
  const canvas = document.querySelector("#registerCanvas");
  let cleanup;
  if (canvas) {
    cleanup = createParticles(canvas, { count: 50, color: "255, 255, 255", minSize: 1, maxSize: 3, speed: 0.2, connectDist: 100 });
  }

  const form = document.querySelector("#registerForm");
  const errorDiv = document.querySelector("#registerError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorDiv.classList.add("hidden");

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirm = form.confirmPassword.value;

    if (!name || !email || !password) {
      errorDiv.textContent = "Todos los campos son obligatorios";
      errorDiv.className = "mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm";
      return;
    }
    if (password.length < 6) {
      errorDiv.textContent = "La contraseña debe tener al menos 6 caracteres";
      errorDiv.className = "mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm";
      return;
    }
    if (password !== confirm) {
      errorDiv.textContent = "Las contraseñas no coinciden";
      errorDiv.className = "mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm";
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<svg class="animate-spin w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>';

    try {
      const existing = await getUsersByEmail(email);
      if (existing.length > 0) throw new Error("El correo ya está registrado");
      await registerUser({ name, email, password, role: "user" });
      showToast("Cuenta creada con éxito. Inicia sesión.", "success");
      navigateTo("login");
    } catch (error) {
      errorDiv.textContent = error.message || "Error al registrar";
      errorDiv.className = "mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm";
      submitBtn.disabled = false;
      submitBtn.textContent = "Crear cuenta";
    }
  });
};
