// Importa componentes y servicios necesarios para la vista de inicio
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import EmptyState from "@/components/EmptyState";
import { getSession, isAdmin } from "@/utils";
import { getScreenings } from "@/services/screening.service";
import { getReservations } from "@/services/reservation.service";
import { getRooms } from "@/services/room.service";
import { showToast } from "@/components/Toast";
import { icon } from "@/utils/icons";

// Vista de inicio (panel de control) con contenido diferenciado según el rol del usuario
export default function homeView() {
  const user = getSession();
  return `
    ${Navbar()}
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold">Bienvenido, ${user?.name}</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Panel de control</p>
        </div>
        <span class="text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium uppercase">${user?.role}</span>
      </div>

      <div id="statsGrid" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="col-span-full text-center py-4 text-gray-400">Cargando estadísticas...</div>
      </div>

      ${isAdmin() ? `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-stagger">
          <button data-nav="screenings/create" class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover-lift text-left">
            <span class="text-2xl">${icon("clapperboard", "w-8 h-8")}</span>
            <h3 class="font-semibold mt-2">Nueva Función</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Agregar una función a la cartelera</p>
          </button>
          <button data-nav="rooms" class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover-lift text-left">
            <span class="text-2xl">${icon("landmark", "w-8 h-8")}</span>
            <h3 class="font-semibold mt-2">Gestionar Salas</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Administrar salas de cine</p>
          </button>
          <button data-nav="dashboard" class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover-lift text-left">
            <span class="text-2xl">${icon("bar-chart-3", "w-8 h-8")}</span>
            <h3 class="font-semibold mt-2">Dashboard</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Estadísticas de ocupación</p>
          </button>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 animate-stagger">
          <button data-nav="screenings" class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover-lift text-left">
            <span class="text-2xl">${icon("clapperboard", "w-8 h-8")}</span>
            <h3 class="font-semibold mt-2">Ver Cartelera</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Consulta funciones disponibles</p>
          </button>
          <button data-nav="reservations" class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover-lift text-left">
            <span class="text-2xl">${icon("ticket", "w-8 h-8")}</span>
            <h3 class="font-semibold mt-2">Mis Reservas</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Ver y gestionar tus reservas</p>
          </button>
        </div>
      `}

      <div id="recentSection" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 class="text-lg font-bold mb-4">Reservas Recientes</h2>
        <div id="recentContainer">${EmptyState({ message: "Cargando reservas..." })}</div>
      </div>
    </div>
  `;
}

// Inicializa la carga de datos: estadísticas, tarjetas de acceso rápido y reservas recientes
homeView._init = async () => {
  const user = getSession();
  const statsGrid = document.querySelector("#statsGrid");
  const recentContainer = document.querySelector("#recentContainer");

  try {
    // Obtiene funciones, reservas y salas en paralelo
    const [screenings, reservations, rooms] = await Promise.all([
      getScreenings(),
      getReservations(),
      getRooms(),
    ]);

    const totalScreenings = screenings.length;
    const activeScreenings = screenings.filter((s) => s.status === "Activa").length;
    const totalReservations = reservations.length;
    const totalRooms = rooms.length;
    const confirmedReservations = reservations.filter((r) => r.status === "Confirmada").length;
    const totalSeats = rooms.reduce((sum, r) => sum + r.capacity, 0);

    const userReservations = reservations.filter((r) => r.userId === user.id);
    // Obtiene las últimas 5 reservas (invertidas para mostrar las más recientes primero)
    const recentReservations = isAdmin()
      ? reservations.slice(-5).reverse()
      : userReservations.slice(-5).reverse();

    // Renderiza tarjetas de estadísticas según el rol
    if (isAdmin()) {
      statsGrid.innerHTML = [
        StatsCard({ title: "Funciones", value: `${activeScreenings}/${totalScreenings}`, icon: icon("clapperboard", "w-6 h-6"), color: "indigo" }),
        StatsCard({ title: "Reservas", value: totalReservations, icon: icon("ticket", "w-6 h-6"), color: "emerald" }),
        StatsCard({ title: "Confirmadas", value: confirmedReservations, icon: icon("circle-check", "w-6 h-6"), color: "cyan" }),
        StatsCard({ title: "Salas", value: totalRooms, icon: icon("landmark", "w-6 h-6"), color: "amber" }),
      ].join("");
    } else {
      statsGrid.innerHTML = [
        StatsCard({ title: "Mis Reservas", value: userReservations.length, icon: icon("ticket", "w-6 h-6"), color: "indigo" }),
        StatsCard({ title: "Funciones Disponibles", value: activeScreenings, icon: icon("clapperboard", "w-6 h-6"), color: "emerald" }),
        StatsCard({ title: "Asientos Totales", value: totalSeats, icon: icon("armchair", "w-6 h-6"), color: "amber" }),
        StatsCard({ title: "Salas", value: totalRooms, icon: icon("landmark", "w-6 h-6"), color: "cyan" }),
      ].join("");
    }

    // Muestra reservas recientes o un mensaje de estado vacío
    if (recentReservations.length === 0) {
      recentContainer.innerHTML = EmptyState({ message: "No hay reservas recientes", icon: icon("inbox", "w-8 h-8") });
    } else {
      recentContainer.innerHTML = `
        <div class="space-y-3">
          ${recentReservations
            .map((r) => {
              const screening = screenings.find((s) => s.id === r.screeningId);
              const statusColors = {
                Pendiente: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
                Confirmada: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
                Cancelada: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
              };
              return `
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p class="font-medium text-sm">${screening?.movie || "Función #" + r.screeningId}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${r.quantity} asiento(s) · ${r.reservationDate}</p>
                  </div>
                  <span class="text-xs px-2 py-1 rounded-full font-medium ${statusColors[r.status] || "bg-gray-100 text-gray-700"}">${r.status}</span>
                </div>
              `;
            })
            .join("")}
        </div>
      `;
    }
  } catch (error) {
    console.error("Home load error:", error);
    showToast("Error al cargar datos del panel", "error");
  }
};
