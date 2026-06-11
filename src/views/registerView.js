// Importa funciones de navegación y notificaciones toast
import { navigateTo } from "@/router/router";
import { showToast } from "@/components/Toast";

// Vista de formulario de registro de nuevo usuario
export default function registerView() {
  return `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-indigo-600 dark:text-indigo-400">CineReserve</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-2">Crear una cuenta nueva</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 class="text-2xl font-bold mb-6">Registro</h2>

          <form id="registerForm">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre completo</label>
              <input type="text" name="name" placeholder="Tu nombre" required
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo electrónico</label>
              <input type="email" name="email" placeholder="correo@ejemplo.com" required
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
              <input type="password" name="password" placeholder="Mínimo 6 caracteres" required minlength="6"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar contraseña</label>
              <input type="password" name="confirmPassword" placeholder="Repite la contraseña" required
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
            </div>

            <button type="submit" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
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
  `;
}

// Inicializa eventos del formulario de registro con validaciones y llamada a la API
registerView._init = () => {
  const form = document.querySelector("#registerForm");
  const errorDiv = document.querySelector("#registerError");

  // Maneja el envío del formulario de registro
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorDiv.classList.add("hidden");

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirm = form.confirmPassword.value;

    // Valida que todos los campos estén completos
    if (!name || !email || !password) {
      errorDiv.textContent = "Todos los campos son obligatorios";
      errorDiv.classList.remove("hidden");
      return;
    }

    // Valida longitud mínima de la contraseña
    if (password.length < 6) {
      errorDiv.textContent = "La contraseña debe tener al menos 6 caracteres";
      errorDiv.classList.remove("hidden");
      return;
    }

    // Valida que las contraseñas coincidan
    if (password !== confirm) {
      errorDiv.textContent = "Las contraseñas no coinciden";
      errorDiv.classList.remove("hidden");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Registrando...";

    try {
      // Verifica si el correo ya existe en la base de datos
      const existing = await (await fetch("http://localhost:3001/users?email=" + encodeURIComponent(email))).json();
      if (existing.length > 0) {
        throw new Error("El correo ya está registrado");
      }

      // Crea el nuevo usuario con rol "user" por defecto
      await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "user" }),
      });

      showToast("Cuenta creada con éxito. Inicia sesión.", "success");
      navigateTo("login");
    } catch (error) {
      errorDiv.textContent = error.message || "Error al registrar";
      errorDiv.className = "mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm";
      submitBtn.disabled = false;
      submitBtn.textContent = "Crear cuenta";
    }
  });

  // Asigna navegación a enlaces con data-nav
  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(el.dataset.nav);
    });
  });
};
