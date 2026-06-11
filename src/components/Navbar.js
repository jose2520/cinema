// Importa utilidades de sesión y navegación para el menú de navegación
import { getSession, removeSession, isAdmin } from "@/utils";
import { navigateTo } from "@/router/router";

// Componente de barra de navegación principal con enlaces según el rol del usuario
export default function Navbar() {
  // Obtiene la sesión actual del usuario
  const user = getSession();
  // Determina si el tema oscuro está activo según localStorage y sincroniza la clase en <html>
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  const isDark = document.documentElement.classList.contains("dark");

  // Programa la asignación de eventos después de que el HTML se renderice en el DOM
  setTimeout(() => {
    // Asigna navegación a todos los elementos con atributo data-nav
    document.querySelectorAll("[data-nav]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo(el.dataset.nav);
      });
    });

    // Asigna el evento de cierre de sesión al botón "Salir"
    document.querySelector("#logoutBtn")?.addEventListener("click", () => {
      removeSession();
      navigateTo("login");
    });

    // Maneja el toggle de tema oscuro/claro y persiste la preferencia en localStorage
    const toggle = document.querySelector("#themeToggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        document.documentElement.classList.toggle("dark");
        const nowDark = document.documentElement.classList.contains("dark");
        localStorage.setItem("theme", nowDark ? "dark" : "light");
        toggle.textContent = nowDark ? "☀️" : "🌙";
      });
    }
  });

  // Elementos de navegación para usuarios normales
  const userItems = [
    { label: "Inicio", path: "home" },
    { label: "Cartelera", path: "screenings" },
    { label: "Mis Reservas", path: "reservations" },
  ];

  // Elementos de navegación adicionales para administradores
  const adminItems = [
    { label: "➕ Función", path: "screenings/create" },
    { label: "🏛️ Salas", path: "rooms" },
    { label: "📊 Dashboard", path: "dashboard" },
    { label: "👥 Usuarios", path: "users" },
  ];

  // Retorna el HTML completo de la barra de navegación con soporte responsive y dark mode
  return `
    <nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-8">
            <a href="/home" data-nav="home" class="text-xl font-bold text-indigo-600 dark:text-indigo-400">CineReserve</a>
            <div class="hidden md:flex items-center gap-1">
              ${userItems
                .map(
                  (item) =>
                    `<a href="/${item.path}" data-nav="${item.path}" class="px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">${item.label}</a>`
                )
                .join("")}
              ${isAdmin()
                ? adminItems
                    .map(
                      (item) =>
                        `<a href="/${item.path}" data-nav="${item.path}" class="px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">${item.label}</a>`
                    )
                    .join("")
                : ""}
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button id="themeToggle" class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-lg">
              ${isDark ? "☀️" : "🌙"}
            </button>

            <div class="flex items-center gap-2">
              <span class="hidden sm:inline text-sm text-gray-600 dark:text-gray-400">
                ${user?.name}
                <span class="text-xs px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 ml-1">
                  ${user?.role}
                </span>
              </span>
              <button id="logoutBtn" class="px-3 py-1.5 text-sm rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors font-medium">
                Salir
              </button>
            </div>
          </div>
        </div>

        <div class="md:hidden flex gap-1 pb-2 overflow-x-auto">
          ${userItems
            .map(
              (item) =>
                `<a href="/${item.path}" data-nav="${item.path}" class="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">${item.label}</a>`
            )
            .join("")}
          ${isAdmin()
            ? adminItems
                .map(
                  (item) =>
                    `<a href="/${item.path}" data-nav="${item.path}" class="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">${item.label}</a>`
                )
                .join("")
            : ""}
        </div>
      </div>
    </nav>
  `;
}
