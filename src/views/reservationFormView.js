// Importa componentes, servicios y utilidades para el formulario de reservas
import Navbar from "@/components/Navbar";
import { getSession } from "@/utils";
import { getScreenings, getScreeningById } from "@/services/screening.service";
import { getReservationById, createReservation, updateReservation } from "@/services/reservation.service";
import { navigateTo } from "@/router/router";
import { showToast } from "@/components/Toast";

const SEAT_AVAILABLE = "🟢";
const SEAT_OCCUPIED = "🔴";
const SEAT_SELECTED = "🟡";

// Genera una rejilla de asientos distribuyendo los ocupados de forma determinista
const generateSeatGrid = (totalCapacity, availableSeats, screeningId) => {
  const cols = Math.min(10, Math.ceil(Math.sqrt(totalCapacity)));
  const rows = Math.ceil(totalCapacity / cols);
  const occupiedCount = totalCapacity - availableSeats;
  const seats = [];

  const occupiedSet = new Set();
  let idx = 0;
  while (occupiedSet.size < occupiedCount) {
    const hash = ((screeningId?.charCodeAt(idx % screeningId?.length) || 7) + idx * 13) % totalCapacity;
    occupiedSet.add(hash);
    idx++;
  }

  let index = 0;
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      if (index >= totalCapacity) break;
      const seatId = `${String.fromCharCode(65 + r)}${c + 1}`;
      const isOccupied = occupiedSet.has(index);
      row.push({ id: seatId, occupied: isOccupied, selected: false });
      index++;
    }
    if (row.length > 0) seats.push(row);
  }

  return seats;
};

const renderSeatGrid = (seats) => {
  return seats
    .map(
      (row, ri) => `
      <div class="flex justify-center gap-1.5 mb-1.5">
        <span class="text-xs text-gray-400 w-5 text-right leading-8">${String.fromCharCode(65 + ri)}</span>
        ${row
          .map(
            (seat) => `
          <button type="button" data-seat="${seat.id}" data-occupied="${seat.occupied}"
            class="seat-btn text-lg leading-none p-1 rounded transition-transform hover:scale-110 ${seat.occupied ? "cursor-not-allowed opacity-60" : "cursor-pointer"}">
            ${seat.occupied ? SEAT_OCCUPIED : seat.selected ? SEAT_SELECTED : SEAT_AVAILABLE}
          </button>
        `
          )
          .join("")}
      </div>
    `
    )
    .join("");
};

// Vista de formulario para crear o editar una reserva
export default function reservationFormView(params) {
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
          <div class="flex items-center justify-between mb-3">
            <label class="block text-sm font-medium">Selecciona tus asientos</label>
            <div class="flex items-center gap-3 text-xs text-gray-500">
              <span>${SEAT_AVAILABLE} Libre</span>
              <span>${SEAT_SELECTED} Seleccionado</span>
              <span>${SEAT_OCCUPIED} Ocupado</span>
            </div>
          </div>
          <div id="seatMap" class="py-4 overflow-x-auto">
            <p class="text-sm text-gray-400 text-center">Cargando mapa de asientos...</p>
          </div>
          <div class="text-center mb-2">
            <span class="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg font-semibold text-lg">
              🎟️ <span id="selectedCount">0</span> asiento(s)
            </span>
          </div>
          <input type="hidden" name="quantity" value="0">
          <p id="maxSeats" class="text-xs text-gray-400 text-center mt-1"></p>
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
  const seatMap = document.querySelector("#seatMap");
  const quantityInput = form.querySelector('[name="quantity"]');
  const selectedCount = document.querySelector("#selectedCount");
  const maxSeats = document.querySelector("#maxSeats");

  let screening = null;
  let seatGrid = [];
  let maxSelectable = 0;

  const updateQuantity = () => {
    const selected = seatGrid.flat().filter((s) => s.selected).length;
    if (selected > maxSelectable) {
      showToast(`Máximo ${maxSelectable} asientos`, "warning");
      return;
    }
    selectedCount.textContent = selected;
    quantityInput.value = selected;
  };

  const renderSeats = () => {
    seatMap.innerHTML = `
      <div class="mb-4 text-center">
        <div class="inline-block bg-gray-200 dark:bg-gray-600 rounded-lg px-6 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">🎬 PANTALLA</div>
      </div>
      ${renderSeatGrid(seatGrid)}
    `;

    seatMap.querySelectorAll("[data-seat]").forEach((btn) => {
      const isOccupied = btn.dataset.occupied === "true";
      if (isOccupied) return;

      btn.addEventListener("click", () => {
        const seatId = btn.dataset.seat;
        for (const row of seatGrid) {
          const seat = row.find((s) => s.id === seatId);
          if (seat) {
            if (!seat.occupied) {
              seat.selected = !seat.selected;
              btn.textContent = seat.selected ? SEAT_SELECTED : SEAT_AVAILABLE;
              btn.classList.toggle("scale-110", seat.selected);
              updateQuantity();
            }
            break;
          }
        }
      });
    });
  };

  try {
    if (isEdit) {
      const reservation = await getReservationById(editId);
      if (reservation.userId !== user.id && user.role !== "admin") {
        showToast("No tienes permiso para editar esta reserva", "error");
        navigateTo("reservations");
        return;
      }
      screening = await getScreeningById(reservation.screeningId);
      maxSelectable = screening.availableSeats + reservation.quantity;
      seatGrid = generateSeatGrid(screening.totalCapacity, screening.availableSeats, screening.id);

      let preSelected = 0;
      for (const row of seatGrid) {
        for (const seat of row) {
          if (!seat.occupied && preSelected < reservation.quantity) {
            seat.selected = true;
            preSelected++;
          }
        }
      }

      screeningInfo.innerHTML = `
        <p class="font-semibold">${screening.movie}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">📅 ${screening.date} · 🕐 ${screening.time} · 🏛️ ${screening.room?.name} · 💺 ${screening.availableSeats} disponibles</p>
        <p class="text-xs text-gray-400 mt-1">Editando reserva de ${reservation.quantity} asiento(s) — Estado: ${reservation.status}</p>
      `;
      maxSeats.textContent = `Máximo: ${maxSelectable} asientos`;
      renderSeats();
      updateQuantity();
    } else if (screeningId) {
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
      maxSelectable = screening.availableSeats;
      seatGrid = generateSeatGrid(screening.totalCapacity, screening.availableSeats, screening.id);

      screeningInfo.innerHTML = `
        <p class="font-semibold">${screening.movie}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">📅 ${screening.date} · 🕐 ${screening.time} · 🏛️ ${screening.room?.name} · 💺 ${screening.availableSeats} disponibles</p>
      `;
      maxSeats.textContent = `Máximo: ${maxSelectable} asientos`;
      renderSeats();
      updateQuantity();
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const quantity = Number(quantityInput.value);

    if (quantity < 1 || quantity > maxSelectable) {
      showToast(`Selecciona entre 1 y ${maxSelectable} asientos`, "warning");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Guardando...";

    try {
      if (isEdit) {
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

  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(el.dataset.nav);
    });
  });
};
