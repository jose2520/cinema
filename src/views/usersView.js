// Importa componentes y servicios para la vista de usuarios
import Navbar from "@/components/Navbar";
import EmptyState from "@/components/EmptyState";
import { getAllUsers } from "@/services/auth.service";
import { icon } from "@/utils/icons";

// Vista que lista todos los usuarios registrados en una tabla (solo admin)
export default function usersView() {
  return `
    ${Navbar()}
    <div class="max-w-4xl mx-auto px-4 py-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Usuarios Registrados</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Lista de todos los usuarios del sistema</p>
      </div>

      <div id="usersContainer" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        ${EmptyState({ message: "Cargando usuarios..." })}
      </div>
    </div>
  `;
}

// Carga la lista de usuarios y renderiza una tabla con ID, nombre, email y rol
usersView._init = async () => {
  const container = document.querySelector("#usersContainer");

  try {
    const users = await getAllUsers();
    container.innerHTML = `
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-500"></th>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">ID</th>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Nombre</th>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Email</th>
            <th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Rol</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          ${users
            .map(
              (u) => {
              const initials = u.name?.charAt(0).toUpperCase() || "?";
              return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td class="px-4 py-3 text-sm">
                <span class="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  ${u.photo
                    ? `<img src="${u.photo}" alt="" class="w-full h-full object-cover">`
                    : initials}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">${u.id}</td>
              <td class="px-4 py-3 text-sm font-medium">${u.name}</td>
              <td class="px-4 py-3 text-sm text-gray-500">${u.email}</td>
              <td class="px-4 py-3 text-sm">
                <span class="text-xs px-2 py-1 rounded-full font-medium ${
                  u.role === "admin"
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }">${u.role}</span>
              </td>
            </tr>
          `;
            })
            .join("")}
        </tbody>
      </table>
    `;
  } catch {
    container.innerHTML = EmptyState({ message: "Error al cargar usuarios", icon: icon("circle-x", "w-8 h-8") });
  }
};
