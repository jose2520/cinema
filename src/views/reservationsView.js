// Importa componentes, servicios y utilidades para la vista de listado de reservas
import Navbar from "@/components/Navbar";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import { getSession, isAdmin } from "@/utils";
import { getReservations, updateReservation, deleteReservation } from "@/services/reservation.service";
import { getScreenings } from "@/services/screening.service";
import { navigateTo } from "@/router/router";
import { showToast } from "@/components/Toast";

// Vista que lista las reservas con filtro por estado y acciones según el rol
export default function reservationsView() {
  return `
    ${Navbar()}
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold">${isAdmin() ? "Todas las Reservas" : "Mis Reservas"}</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">${isAdmin() ? "Gestiona todas las reservas del sistema" : "Visualiza y gestiona tus reservas"}</p>
        </div>
      </div>

      <div class="mb-4 flex flex-wrap gap-2">
        <select id="filterReservationStatus" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Confirmada">Confirmada</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </div>

      <div id="reservationsList" class="space-y-3">
        ${EmptyState({ message: "Cargando reservas..." })}
      </div>
    </div>
  `;
}

// Inicializa la vista: carga datos, renderiza lista y asigna eventos de acciones
reservationsView._init = async () => {
  const user = getSession();
  const list = document.querySelector("#reservationsList");
  const filterStatus = document.querySelector("#filterReservationStatus");

  let reservations = [];
  let screenings = [];

  // Mapa de colores para los estados de las reservas
  const statusColors = {
    Pendiente: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    Confirmada: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    Cancelada: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  };

  // Función que filtra y renderiza la lista de reservas según el estado seleccionado
  const render = () => {
    const status = filterStatus.value;
    let filtered = isAdmin() ? reservations : reservations.filter((r) => r.userId === user.id);
    if (status) filtered = filtered.filter((r) => r.status === status);

    if (filtered.length === 0) {
      list.innerHTML = EmptyState({ message: "No hay reservas", icon: "🎟️" });
      return;
    }

    // Renderiza cada reserva con acciones según permisos
    list.innerHTML = filtered
      .map((r) => {
        const s = screenings.find((x) => x.id === r.screeningId);
        const canCancel = r.status !== "Cancelada" && (isAdmin() || r.userId === user.id);
        const canEdit = r.status === "Pendiente" && (isAdmin() || r.userId === user.id);
        const canApprove = isAdmin() && r.status === "Pendiente";

        return `
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-semibold">${s?.movie || "Función #" + r.screeningId}</h3>
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[r.status] || ""}">${r.status}</span>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 space-y-0.5">
                  <p>📅 ${s?.date || ""} · 🕐 ${s?.time || ""} · 🏛️ ${s?.room?.name || "Sala #" + s?.roomId || ""}</p>
                  <p>🎟️ ${r.quantity} asiento(s) · Reservado: ${r.reservationDate}</p>
                  ${isAdmin() ? `<p class="text-xs text-indigo-500">Usuario ID: ${r.userId}</p>` : ""}
                </div>
              </div>
              <div class="flex gap-2 flex-shrink-0">
                ${canApprove
                  ? `
                    <button data-approve="${r.id}" class="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-medium transition-colors">✅ Aprobar</button>
                    <button data-reject="${r.id}" class="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-xs font-medium transition-colors">❌ Rechazar</button>
                  `
                  : ""}
                ${canEdit && !canApprove
                  ? `<button data-nav="reservations/edit/${r.id}" class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-xs transition-colors">✏️</button>`
                  : ""}
                ${canCancel && !canApprove
                  ? `<button data-cancel="${r.id}" class="px-3 py-1.5 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 rounded-lg text-xs transition-colors">🗑️</button>`
                  : ""}
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    // Asigna eventos de navegación a botones con data-nav
    list.querySelectorAll("[data-nav]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo(el.dataset.nav);
      });
    });

    // Asigna eventos de cancelación con modal de confirmación
    list.querySelectorAll("[data-cancel]").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.dataset.cancel;
        const r = reservations.find((x) => x.id === id);
        document.body.insertAdjacentHTML(
          "beforeend",
          Modal({
            id: "cancelModal",
            title: "Cancelar reserva",
            content: `¿Cancelar la reserva de ${r?.quantity} asiento(s)? Esta acción no se puede deshacer.`,
            confirmText: "Cancelar Reserva",
            onConfirm: async () => {
              try {
                const reservation = reservations.find((x) => x.id === id);
                const screening = screenings.find((s) => s.id === reservation.screeningId);
                await updateReservation(id, { status: "Cancelada" });
                if (screening) {
                  await (await fetch(`http://localhost:3001/screenings/${screening.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ availableSeats: screening.availableSeats + reservation.quantity }),
                  })).json();
                }
                reservations = reservations.map((x) => (x.id === id ? { ...x, status: "Cancelada" } : x));
                render();
                showToast("Reserva cancelada", "success");
              } catch {
                showToast("Error al cancelar reserva", "error");
              }
            },
          })
        );
      });
    });

    // Asigna eventos de aprobación (solo admin)
    list.querySelectorAll("[data-approve]").forEach((el) => {
      el.addEventListener("click", async () => {
        const id = el.dataset.approve;
        try {
          await updateReservation(id, { status: "Confirmada" });
          reservations = reservations.map((x) => (x.id === id ? { ...x, status: "Confirmada" } : x));
          render();
          showToast("Reserva confirmada", "success");
        } catch {
          showToast("Error al aprobar reserva", "error");
        }
      });
    });

    // Asigna eventos de rechazo (solo admin) con devolución de asientos
    list.querySelectorAll("[data-reject]").forEach((el) => {
      el.addEventListener("click", async () => {
        const id = el.dataset.reject;
        try {
          await updateReservation(id, { status: "Cancelada" });
          const reservation = reservations.find((x) => x.id === id);
          const screening = screenings.find((s) => s.id === reservation.screeningId);
          if (screening) {
            await (await fetch(`http://localhost:3001/screenings/${screening.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ availableSeats: screening.availableSeats + reservation.quantity }),
            })).json();
          }
          reservations = reservations.map((x) => (x.id === id ? { ...x, status: "Cancelada" } : x));
          render();
          showToast("Reserva rechazada", "warning");
        } catch {
          showToast("Error al rechazar reserva", "error");
        }
      });
    });
  };

  try {
    [screenings, reservations] = await Promise.all([getScreenings(), getReservations()]);
    render();
  } catch {
    list.innerHTML = EmptyState({ message: "Error al cargar reservas", icon: "❌" });
  }

  // Escucha cambios en el filtro de estado para re-renderizar
  filterStatus.addEventListener("change", render);
};
