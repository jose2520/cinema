// Importa componentes, servicios y utilidades para el formulario de reservas
import Navbar from "@/components/Navbar";
import { getSession } from "@/utils";
import { getScreenings, getScreeningById } from "@/services/screening.service";
import { getReservationById, createReservation, updateReservation } from "@/services/reservation.service";
import { navigateTo } from "@/router/router";
import { showToast } from "@/components/Toast";

// Vista de formulario para crear o editar una reserva
export default function reservationFormView(params) {
  // Determina si es edición (tiene id pero no screeningId) o creación nueva
  const isEdit = !!params?.id && !params?.screeningId;
  const screeningId = params?.screeningId;
  return `
    ${Navbar()}
    <div class="max-w-xl mx-auto px-4 py-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">${isEdit ? "Editar" : "Nueva"} Reserva</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">${isEdit ? "Modifica tu reserva" : "Reserva tus entradas para una función"}</p>
      </div>

      <form id="reservationForm" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <div id="screeningInfo" class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p class="text-sm text-gray-500">Cargando información de la función...</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Cantidad de asientos</label>
          <input type="number" name="quantity" min="1" max="10" value="1" required
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
          <p id="maxSeats" class="text-xs text-gray-400 mt-1"></p>
        </div>

        <div class="flex gap-3 pt-4">
          <button type="submit" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
            ${isEdit ? "Actualizar Reserva" : "Confirmar Reserva"}
          </button>
          <button type="button" data-nav="screenings" class="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `;
}

// Inicializa el formulario cargando datos de la función y manejando la lógica de guardado
reservationFormView._init = async (params) => {
  const user = getSession();
  const isEdit = !!params?.id && !params?.screeningId;
  const screeningId = params?.screeningId || (isEdit ? null : null);
  const editId = params?.id;

  const form = document.querySelector("#reservationForm");
  const screeningInfo = document.querySelector("#screeningInfo");
  const quantityInput = form.querySelector('[name="quantity"]');
  const maxSeats = document.querySelector("#maxSeats");

  let screening = null;

  try {
    if (isEdit) {
      // Modo edición: carga la reserva y verifica permisos del usuario
      const reservation = await getReservationById(editId);
      if (reservation.userId !== user.id && user.role !== "admin") {
        showToast("No tienes permiso para editar esta reserva", "error");
        navigateTo("reservations");
        return;
      }
      screening = await getScreeningById(reservation.screeningId);
      quantityInput.value = reservation.quantity;
      screeningInfo.innerHTML = `
        <p class="font-semibold">${screening.movie}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">📅 ${screening.date} · 🕐 ${screening.time} · 🏛️ ${screening.room?.name} · 💺 ${screening.availableSeats} disponibles</p>
        <p class="text-xs text-gray-400 mt-1">Editando reserva de ${reservation.quantity} asiento(s) — Estado: ${reservation.status}</p>
      `;
      maxSeats.textContent = `Máximo: ${screening.availableSeats + reservation.quantity} asientos`;
      quantityInput.max = screening.availableSeats + reservation.quantity;
    } else if (screeningId) {
      // Modo creación: carga la función y valida disponibilidad
      screening = await getScreeningById(screeningId);
      if (screening.status !== "Activa") {
        showToast("Esta función no está disponible", "error");
        navigateTo("screenings");
        return;
      }
      if (screening.availableSeats <= 0) {
        showToast("No hay asientos disponibles", "error");
        navigateTo("screenings");
        return;
      }
      screeningInfo.innerHTML = `
        <p class="font-semibold">${screening.movie}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">📅 ${screening.date} · 🕐 ${screening.time} · 🏛️ ${screening.room?.name} · 💺 ${screening.availableSeats} disponibles</p>
      `;
      maxSeats.textContent = `Máximo: ${screening.availableSeats} asientos`;
      quantityInput.max = screening.availableSeats;
    } else {
      showToast("Error: función no especificada", "error");
      navigateTo("screenings");
      return;
    }
  } catch {
    showToast("Error al cargar los datos", "error");
    navigateTo("screenings");
    return;
  }

  // Maneja el envío del formulario: crea o actualiza la reserva y ajusta asientos disponibles
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const quantity = Number(quantityInput.value);

    // Validación de cantidad dentro del rango permitido
    if (quantity < 1 || quantity > Number(quantityInput.max)) {
      showToast(`Cantidad inválida (máx: ${quantityInput.max})`, "warning");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Guardando...";

    try {
      if (isEdit) {
        // Actualiza reserva existente y recalcula asientos disponibles
        const oldReservation = await getReservationById(editId);
        const diff = quantity - oldReservation.quantity;
        if (diff > 0 && diff > screening.availableSeats) {
          showToast("No hay suficientes asientos disponibles", "error");
          submitBtn.disabled = false;
          submitBtn.textContent = "Actualizar Reserva";
          return;
        }
        await updateReservation(editId, { quantity });
        await (await fetch(`http://localhost:3001/screenings/${screening.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ availableSeats: screening.availableSeats - diff }),
        })).json();
        showToast("Reserva actualizada", "success");
      } else {
        // Crea nueva reserva y descuenta asientos disponibles
        await createReservation({ userId: user.id, screeningId: screening.id, quantity });
        await (await fetch(`http://localhost:3001/screenings/${screening.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ availableSeats: screening.availableSeats - quantity }),
        })).json();
        showToast("Reserva creada con éxito", "success");
      }
      navigateTo("reservations");
    } catch (error) {
      showToast("Error al guardar la reserva", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = isEdit ? "Actualizar Reserva" : "Confirmar Reserva";
    }
  });

  // Asigna navegación a elementos con data-nav
  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(el.dataset.nav);
    });
  });
};
