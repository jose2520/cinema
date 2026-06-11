// Importa componentes y servicios para el formulario de salas
import Navbar from "@/components/Navbar";
import { getRoomById, createRoom, updateRoom } from "@/services/room.service";
import { navigateTo } from "@/router/router";
import { showToast } from "@/components/Toast";

// Vista de formulario para crear o editar una sala de cine
export default function roomFormView(params) {
  const isEdit = !!params?.id;
  return `
    ${Navbar()}
    <div class="max-w-xl mx-auto px-4 py-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">${isEdit ? "Editar" : "Nueva"} Sala</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">${isEdit ? "Modifica los datos de la sala" : "Registra una nueva sala de cine"}</p>
      </div>

      <form id="roomForm" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Nombre de la sala</label>
          <input type="text" name="name" required placeholder="Ej: Sala 4"
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Capacidad</label>
          <input type="number" name="capacity" min="1" required placeholder="Ej: 100"
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Tipo</label>
          <select name="type" required
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="2D">2D</option>
            <option value="3D">3D</option>
            <option value="IMAX">IMAX</option>
          </select>
        </div>

        ${isEdit ? `
        <div>
          <label class="block text-sm font-medium mb-1">Estado</label>
          <select name="status"
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="active">Activa</option>
            <option value="inactive">Inactiva</option>
          </select>
        </div>
        ` : ""}

        <div class="flex gap-3 pt-4">
          <button type="submit" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
            ${isEdit ? "Guardar Cambios" : "Crear Sala"}
          </button>
          <button type="button" data-nav="rooms" class="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `;
}

// Inicializa el formulario: si es edición carga los datos existentes y maneja el envío
roomFormView._init = async (params) => {
  const isEdit = !!params?.id;
  const form = document.querySelector("#roomForm");

  // Si es edición, carga los datos de la sala existente en el formulario
  if (isEdit) {
    try {
      const room = await getRoomById(params.id);
      form.name.value = room.name;
      form.capacity.value = room.capacity;
      form.type.value = room.type;
      if (form.status) form.status.value = room.status;
    } catch {
      showToast("Error al cargar datos de la sala", "error");
      navigateTo("rooms");
    }
  }

  // Maneja el envío del formulario para crear o actualizar la sala
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Guardando...";

    try {
      const data = {
        name: form.name.value.trim(),
        capacity: Number(form.capacity.value),
        type: form.type.value,
      };

      if (isEdit) {
        if (form.status) data.status = form.status.value;
        await updateRoom(params.id, data);
        showToast("Sala actualizada", "success");
      } else {
        await createRoom(data);
        showToast("Sala creada", "success");
      }
      navigateTo("rooms");
    } catch {
      showToast("Error al guardar la sala", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = isEdit ? "Guardar Cambios" : "Crear Sala";
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
