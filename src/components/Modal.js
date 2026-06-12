// Componente de modal de confirmación con soporte para acción personalizada al confirmar
export default function Modal({ id, title, content, confirmText = "Confirmar", cancelText = "Cancelar", confirmClass, onConfirm }) {
  // Programa la asignación de eventos después de que el HTML se inserte en el DOM
  setTimeout(() => {
    const modal = document.querySelector(`#${id}`);
    const overlay = modal?.querySelector(".modal-overlay");
    const cancelBtn = modal?.querySelector(".modal-cancel");
    const confirmBtn = modal?.querySelector(".modal-confirm");

    // Función que cierra el modal eliminándolo del DOM
    const close = () => modal?.remove();

    // Cierra al hacer clic en la capa oscura de fondo
    overlay?.addEventListener("click", close);
    // Cierra al hacer clic en el botón de cancelar
    cancelBtn?.addEventListener("click", close);
    // Ejecuta la función onConfirm (si existe) y luego cierra el modal
    confirmBtn?.addEventListener("click", () => {
      if (onConfirm) onConfirm();
      close();
    });
  });

  // Retorna el HTML del modal con overlay semitransparente y botones de acción
  return `
    <div id="${id}" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="modal-overlay absolute inset-0 bg-black/50 animate-overlay-in"></div>
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 z-10 animate-scale-in">
        <h3 class="text-lg font-bold mb-3">${title}</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-6">${content}</p>
        <div class="flex justify-end gap-3">
          <button class="modal-cancel px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-105 active:scale-95">
            ${cancelText}
          </button>
          <button class="modal-confirm px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-105 active:scale-95 ${confirmClass || "bg-red-500 hover:bg-red-600"}">
            ${confirmText}
          </button>
        </div>
      </div>
    </div>
  `;
}
