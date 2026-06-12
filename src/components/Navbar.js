// Importa utilidades de sesión y navegación para el menú de navegación
import { getSession, removeSession, isAdmin } from "@/utils";
import { navigateTo } from "@/router/router";
import { icon } from "@/utils/icons";

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
    document.querySelector("#logoutBtn")?.addEventListener("click", () => {
      removeSession();
      navigateTo("login");
    });

    const toggle = document.querySelector("#themeToggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        document.documentElement.classList.toggle("dark");
        const nowDark = document.documentElement.classList.contains("dark");
        localStorage.setItem("theme", nowDark ? "dark" : "light");
        toggle.innerHTML = nowDark ? icon("sun", "w-5 h-5") : icon("moon", "w-5 h-5");
      });
    }
  });

  // Elementos de navegación para usuarios normales
  const userItems = [
    { label: "Inicio", path: "home" },
    { label: "Cartelera", path: "screenings" },
    { label: "Mis Reservas", path: "reservations" },
  ];
  const profileItem = { label: `${icon("user", "w-4 h-4 inline")} Mi Perfil`, path: "profile" };

  // Elementos de navegación adicionales para administradores
  const adminItems = [
    { label: `${icon("plus", "w-4 h-4 inline")} Función`, path: "screenings/create" },
    { label: `${icon("landmark", "w-4 h-4 inline")} Salas`, path: "rooms" },
    { label: `${icon("bar-chart-3", "w-4 h-4 inline")} Dashboard`, path: "dashboard" },
    { label: `${icon("users", "w-4 h-4 inline")} Usuarios`, path: "users" },
  ];

  // Retorna el HTML completo de la barra de navegación con soporte responsive y dark mode
  return `
    <nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-8">
            <a href="/home" data-nav="home" class="text-xl font-bold text-indigo-600 dark:text-indigo-400">CineReserve</a>
            <div class="hidden md:flex items-center gap-1">
              ${[...userItems, profileItem]
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
              ${isDark ? icon("sun", "w-5 h-5") : icon("moon", "w-5 h-5")}
            </button>

            <div class="flex items-center gap-2">
              <span class="hidden sm:inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span class="w-7 h-7 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                  ${user?.photo
                    ? `<img src="${user.photo}" alt="" class="w-full h-full object-cover">`
                    : (user?.name?.charAt(0).toUpperCase() || "?")}
                </span>
                ${user?.name}
                <span class="text-xs px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
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
          ${[...userItems, profileItem]
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
