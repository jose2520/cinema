// Importa componentes y servicios para el formulario de funciones
import Navbar from "@/components/Navbar";
import { getRooms } from "@/services/room.service";
import { getScreeningById, createScreening, updateScreening } from "@/services/screening.service";
import { navigateTo } from "@/router/router";
import { showToast } from "@/components/Toast";

// Vista de formulario para crear o editar una función (screening)
export default function screeningFormView(params) {
  const isEdit = !!params?.id;
  return `
    ${Navbar()}
    <div class="max-w-2xl mx-auto px-4 py-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">${isEdit ? "Editar" : "Nueva"} Función</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">${isEdit ? "Modifica los datos de la función" : "Agrega una nueva función a la cartelera"}</p>
      </div>

      <form id="screeningForm" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Película</label>
          <input type="text" name="movie" required
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Sala</label>
          <select name="roomId" required
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">Seleccionar sala...</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Fecha</label>
            <input type="date" name="date" required
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Hora</label>
            <input type="time" name="time" required
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Estado</label>
          <select name="status"
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="Activa">Activa</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>

        <div class="flex gap-3 pt-4">
          <button type="submit" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
            ${isEdit ? "Guardar Cambios" : "Crear Función"}
          </button>
          <button type="button" data-nav="screenings" class="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `;
}

// Inicializa el formulario: carga salas disponibles y si es edición carga datos existentes
screeningFormView._init = async (params) => {
  const isEdit = !!params?.id;
  const form = document.querySelector("#screeningForm");
  const roomSelect = form.querySelector('[name="roomId"]');

  try {
    // Carga la lista de salas para el selector
    const rooms = await getRooms();
    roomSelect.innerHTML = `
      <option value="">Seleccionar sala...</option>
      ${rooms.map((r) => `<option value="${r.id}">${r.name} (${r.type} - ${r.capacity} asientos)</option>`).join("")}
    `;

    // Si es edición, precarga los datos de la función existente
    if (isEdit) {
      const screening = await getScreeningById(params.id);
      form.movie.value = screening.movie;
      form.roomId.value = screening.roomId;
      form.date.value = screening.date;
      form.time.value = screening.time;
      form.status.value = screening.status;
    }
  } catch {
    showToast("Error al cargar datos", "error");
  }

  // Maneja el envío del formulario para crear o actualizar la función
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Guardando...";

    try {
      // Obtiene la sala seleccionada para conocer la capacidad
      const room = await (await fetch("http://localhost:3001/rooms/" + form.roomId.value)).json();
      const data = {
        movie: form.movie.value.trim(),
        roomId: Number(form.roomId.value),
        date: form.date.value,
        time: form.time.value,
      };

      if (isEdit) {
        if (form.status.value !== undefined) data.status = form.status.value;
        await updateScreening(params.id, data);
        showToast("Función actualizada", "success");
      } else {
        // Asigna capacidad total y disponibles según la sala seleccionada
        data.totalCapacity = room.capacity;
        data.availableSeats = room.capacity;
        await createScreening(data);
        showToast("Función creada", "success");
      }
      navigateTo("screenings");
    } catch (error) {
      showToast("Error al guardar la función", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = isEdit ? "Guardar Cambios" : "Crear Función";
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
