// Importa componentes y servicios para el panel de estadísticas del administrador
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import EmptyState from "@/components/EmptyState";
import { getScreenings } from "@/services/screening.service";
import { getReservations } from "@/services/reservation.service";
import { getRooms } from "@/services/room.service";

// Vista de Dashboard con estadísticas, ocupación por sala y tabla de funciones
export default function dashboardView() {
  return `
    ${Navbar()}
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Estadísticas y ocupación del cine</p>
      </div>

      <div id="dashboardStats" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        ${Array(4).fill('<div class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-24"></div>').join("")}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 class="text-lg font-bold mb-4">Ocupación por Sala</h2>
          <div id="occupancyChart" class="space-y-3">
            <p class="text-sm text-gray-400">Cargando...</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 class="text-lg font-bold mb-4">Distribución de Reservas</h2>
          <div id="reservationChart" class="space-y-3">
            <p class="text-sm text-gray-400">Cargando...</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 class="text-lg font-bold mb-4">Todas las Funciones</h2>
        <div id="allScreeningsTable">
          ${EmptyState({ message: "Cargando funciones..." })}
        </div>
      </div>
    </div>
  `;
}

// Carga y renderiza las estadísticas del dashboard: tarjetas, gráficos de barras y tabla
dashboardView._init = async () => {
  const statsEl = document.querySelector("#dashboardStats");
  const occupancyEl = document.querySelector("#occupancyChart");
  const reservationEl = document.querySelector("#reservationChart");
  const tableEl = document.querySelector("#allScreeningsTable");

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
    const confirmedReservations = reservations.filter((r) => r.status === "Confirmada").length;
    const pendingReservations = reservations.filter((r) => r.status === "Pendiente").length;
    const cancelledReservations = reservations.filter((r) => r.status === "Cancelada").length;
    const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
    const totalBookedSeats = reservations
      .filter((r) => r.status !== "Cancelada")
      .reduce((sum, r) => sum + r.quantity, 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((totalBookedSeats / totalCapacity) * 100) : 0;

    // Renderiza las 4 tarjetas de estadísticas principales
    statsEl.innerHTML = [
      StatsCard({ title: "Funciones Activas", value: `${activeScreenings}/${totalScreenings}`, icon: "🎬", color: "indigo" }),
      StatsCard({ title: "Reservas", value: totalReservations, icon: "🎟️", color: "emerald" }),
      StatsCard({ title: "Ocupación", value: `${occupancyRate}%`, icon: "📈", color: "amber" }),
      StatsCard({ title: "Asientos Vendidos", value: totalBookedSeats, icon: "💺", color: "rose" }),
    ].join("");

    // Renderiza barras de ocupación por cada sala
    occupancyEl.innerHTML = rooms
      .map((room) => {
        const roomScreenings = screenings.filter((s) => s.roomId === room.id);
        const totalSeats = room.capacity * (roomScreenings.length || 1);
        const booked = roomScreenings.reduce((sum, s) => sum + (s.totalCapacity - s.availableSeats), 0);
        const pct = totalSeats > 0 ? Math.round((booked / totalSeats) * 100) : 0;
        return `
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="font-medium">${room.name}</span>
              <span class="text-gray-500">${pct}%</span>
            </div>
            <div class="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style="width:${pct}%"></div>
            </div>
          </div>
        `;
      })
      .join("");

    // Renderiza distribución de reservas (confirmadas, pendientes, canceladas)
    const total = totalReservations || 1;
    reservationEl.innerHTML = [
      { label: "Confirmadas", count: confirmedReservations, color: "bg-emerald-500", pct: Math.round((confirmedReservations / total) * 100) },
      { label: "Pendientes", count: pendingReservations, color: "bg-amber-500", pct: Math.round((pendingReservations / total) * 100) },
      { label: "Canceladas", count: cancelledReservations, color: "bg-red-500", pct: Math.round((cancelledReservations / total) * 100) },
    ]
      .map(
        (item) => `
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span>${item.label}</span>
            <span class="text-gray-500">${item.count} (${item.pct}%)</span>
          </div>
          <div class="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full ${item.color} rounded-full transition-all duration-500" style="width:${item.pct}%"></div>
          </div>
        </div>
      `
      )
      .join("");

    // Renderiza tabla completa de funciones o mensaje de vacío
    if (screenings.length === 0) {
      tableEl.innerHTML = EmptyState({ message: "No hay funciones registradas", icon: "🎬" });
    } else {
      tableEl.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Película</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Sala</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Fecha</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Hora</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Disponibles</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Ocupación</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              ${screenings
                .map(
                  (s) => `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td class="px-4 py-3 font-medium">${s.movie}</td>
                  <td class="px-4 py-3 text-gray-500">${s.room?.name || "—"}</td>
                  <td class="px-4 py-3 text-gray-500">${s.date}</td>
                  <td class="px-4 py-3 text-gray-500">${s.time}</td>
                  <td class="px-4 py-3">${s.availableSeats}/${s.totalCapacity}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="w-16 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div class="h-full bg-indigo-500 rounded-full" style="width:${s.totalCapacity > 0 ? Math.round(((s.totalCapacity - s.availableSeats) / s.totalCapacity) * 100) : 0}%"></div>
                      </div>
                      <span class="text-xs text-gray-400">${s.totalCapacity > 0 ? Math.round(((s.totalCapacity - s.availableSeats) / s.totalCapacity) * 100) : 0}%</span>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2 py-1 rounded-full font-medium ${
                      s.status === "Activa" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    }">${s.status}</span>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;
    }
  } catch {
    statsEl.innerHTML = "<p class='col-span-full text-center text-gray-400 py-8'>Error al cargar estadísticas</p>";
  }
};
