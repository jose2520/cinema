// Importa componentes y servicios para la gestión de salas
import Navbar from "@/components/Navbar";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { getRooms, deleteRoom } from "@/services/room.service";
import { navigateTo } from "@/router/router";
import { showToast } from "@/components/Toast";

// Vista que lista todas las salas con opciones de editar y eliminar
export default function roomsView() {
  return `
    ${Navbar()}
    <div class="max-w-4xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold">Gestión de Salas</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Administra las salas de cine</p>
        </div>
        <button data-nav="rooms/create" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">+ Nueva Sala</button>
      </div>

      <div id="roomsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${EmptyState({ message: "Cargando salas..." })}
      </div>
    </div>
  `;
}

// Carga y renderiza el listado de salas con acciones de edición y eliminación
roomsView._init = async () => {
  const grid = document.querySelector("#roomsGrid");

  // Función interna que obtiene las salas y las renderiza
  const load = async () => {
    try {
      const rooms = await getRooms();
      if (rooms.length === 0) {
        grid.innerHTML = EmptyState({ message: "No hay salas registradas", icon: "🏛️" });
        return;
      }
      // Renderiza cada sala como tarjeta con nombre, tipo, capacidad y acciones
      grid.innerHTML = rooms
        .map(
          (r) => `
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <div class="flex items-start justify-between mb-3">
              <h3 class="font-bold text-lg">${r.name}</h3>
              <span class="text-xs px-2 py-1 rounded-full font-medium ${r.status === "active" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700" : "bg-red-100 text-red-700"}">${r.status}</span>
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-4">
              <p>🎥 ${r.type}</p>
              <p>💺 ${r.capacity} asientos</p>
            </div>
            <div class="flex gap-2">
              <button data-nav="rooms/edit/${r.id}" class="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm transition-colors">✏️ Editar</button>
              <button data-delete="${r.id}" class="px-3 py-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 rounded-lg text-sm transition-colors">🗑️</button>
            </div>
          </div>
        `
        )
        .join("");

      // Asigna navegación a botones de edición
      grid.querySelectorAll("[data-nav]").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          navigateTo(el.dataset.nav);
        });
      });

      // Asigna eventos de eliminación con modal de confirmación
      grid.querySelectorAll("[data-delete]").forEach((el) => {
        el.addEventListener("click", () => {
          const id = el.dataset.delete;
          document.body.insertAdjacentHTML(
            "beforeend",
            Modal({
              id: "deleteRoomModal",
              title: "Eliminar sala",
              content: "¿Estás seguro de eliminar esta sala?",
              confirmText: "Eliminar",
              onConfirm: async () => {
                try {
                  await deleteRoom(id);
                  showToast("Sala eliminada", "success");
                  load();
                } catch {
                  showToast("Error al eliminar sala", "error");
                }
              },
            })
          );
        });
      });
    } catch {
      grid.innerHTML = EmptyState({ message: "Error al cargar salas", icon: "❌" });
    }
  };

  load();

  // Asigna navegación a botones con data-nav (incluyendo el botón "Nueva Sala")
  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(el.dataset.nav);
    });
  });
};
