// Importa componentes, servicios y utilidades para la cartelera de funciones
import Navbar from "@/components/Navbar";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { getSession, isAdmin } from "@/utils";
import { getScreenings, deleteScreening } from "@/services/screening.service";
import { showToast } from "@/components/Toast";
import { icon } from "@/utils/icons";

// Vista de cartelera con búsqueda, filtros y tarjetas de funciones
export default function screeningsView() {
  return `
    ${Navbar()}
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold">Cartelera</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Funciones disponibles</p>
        </div>
        <div class="flex items-center gap-2" id="screeningsActions">
          ${isAdmin() ? '<button data-nav="screenings/create" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">+ Nueva Función</button>' : ''}
        </div>
      </div>

      <div class="mb-4 flex flex-wrap gap-2">
        <input id="searchScreening" type="text" placeholder="Buscar película..." class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm flex-1 min-w-[200px] focus:ring-2 focus:ring-indigo-500 outline-none">
        <input id="filterDate" type="date" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
        <select id="filterStatus" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="">Todos</option>
          <option value="Activa">Activas</option>
          <option value="Cancelada">Canceladas</option>
        </select>
      </div>

      <div id="screeningsGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        ${EmptyState({ message: "Cargando funciones..." })}
      </div>
    </div>
  `;
}

// Inicializa la vista: carga funciones, aplica filtros y asigna eventos
screeningsView._init = async () => {
  const grid = document.querySelector("#screeningsGrid");
  const searchInput = document.querySelector("#searchScreening");
  const filterDate = document.querySelector("#filterDate");
  const filterStatus = document.querySelector("#filterStatus");

  let screenings = [];

  // Función que filtra y renderiza las tarjetas de funciones según búsqueda y filtros
  const render = () => {
    const search = searchInput.value.toLowerCase();
    const date = filterDate.value;
    const status = filterStatus.value;

    const filtered = screenings.filter((s) => {
      if (search && !s.movie.toLowerCase().includes(search)) return false;
      if (date && s.date !== date) return false;
      if (status && s.status !== status) return false;
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = EmptyState({ message: "No se encontraron funciones", icon: icon("clapperboard", "w-8 h-8") });
      return;
    }

    // Renderiza cada función como tarjeta con imagen, detalles y botones de acción
    grid.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-stagger";
    grid.innerHTML = filtered
      .map(
        (s) => `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover-lift ${s.status === "Cancelada" ? "opacity-60" : ""}">
          <div class="aspect-[2/3] bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <img src="${s.image || `https://placehold.co/300x450/1e293b/6366f1?text=${encodeURIComponent(s.movie)}`}" 
                 alt="${s.movie}" 
                 class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                   onerror="this.parentElement.innerHTML='<div class=\\'flex items-center justify-center h-full\\'>${icon("clapperboard", "w-10 h-10 text-gray-400").replace(/"/g, "&quot;")}</div>'">
          </div>
          <div class="p-4">
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-bold text-lg leading-tight">${s.movie}</h3>
              <span class="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2 ${
                s.status === "Activa"
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
              }">${s.status}</span>
            </div>
            <div class="space-y-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <p>${icon("calendar", "w-4 h-4 inline")} ${s.date} · ${icon("clock", "w-4 h-4 inline")} ${s.time}</p>
              <p>${icon("landmark", "w-4 h-4 inline")} ${s.room?.name || "Sala #" + s.roomId} (${s.room?.type || ""})</p>
              <p>${icon("armchair", "w-4 h-4 inline")} ${s.availableSeats}/${s.totalCapacity} asientos</p>
            </div>
            <div class="flex gap-2">
              ${s.status === "Activa" && s.availableSeats > 0
                ? `<button data-nav="reservations/create/${s.id}" class="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95">Reservar</button>`
                : `<button disabled class="flex-1 px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">${s.availableSeats <= 0 ? "Agotado" : "Cancelada"}</button>`}
              ${isAdmin()
                ? `
                  <button data-nav="screenings/edit/${s.id}" class="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all hover:scale-105 active:scale-95">${icon("pencil", "w-4 h-4")}</button>
                  <button data-delete="${s.id}" class="px-3 py-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 rounded-lg transition-all hover:scale-105 active:scale-95">${icon("trash-2", "w-4 h-4")}</button>
                `
                : ""}
            </div>
          </div>
        </div>
      `
      )
      .join("");

    // Asigna eventos de eliminación con modal de confirmación
    grid.querySelectorAll("[data-delete]").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.dataset.delete;
        const s = screenings.find((x) => x.id === id);
        document.body.insertAdjacentHTML(
          "beforeend",
          Modal({
            id: "deleteModal",
            title: "Eliminar función",
            content: `¿Eliminar la función "${s?.movie}" del ${s?.date}?`,
            confirmText: "Eliminar",
            onConfirm: async () => {
              try {
                await deleteScreening(id);
                screenings = screenings.filter((x) => x.id !== id);
                render();
                showToast("Función eliminada", "success");
              } catch {
                showToast("Error al eliminar función", "error");
              }
            },
          })
        );
      });
    });
  };

  try {
    screenings = await getScreenings();
    render();
  } catch {
    grid.innerHTML = EmptyState({ message: "Error al cargar funciones", icon: icon("circle-x", "w-8 h-8") });
  }

  searchInput.addEventListener("input", render);
  filterDate.addEventListener("change", render);
  filterStatus.addEventListener("change", render);
};
