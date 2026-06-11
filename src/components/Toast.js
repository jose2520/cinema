// Variable que almacena la referencia al contenedor de notificaciones toast
let container = null;

// Crea (si no existe) y retorna el contenedor fijo donde se mostrarán los toasts
const getContainer = () => {
  if (!container) {
    container = document.createElement("div");
    container.className = "fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm";
    document.body.appendChild(container);
  }
  return container;
};

// Función exportada que muestra una notificación toast con mensaje, tipo y duración configurables
export const showToast = (message, type = "info", duration = 4000) => {
  const c = getContainer();
  // Mapa de colores según el tipo de notificación
  const colors = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-blue-500",
  };

  // Crea el elemento div del toast con animación de entrada y botón de cierre
  const toast = document.createElement("div");
  toast.className = `${colors[type] || colors.info} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 animate-slide-in`;
  toast.innerHTML = `
    <span class="text-sm font-medium">${message}</span>
    <button class="text-white/80 hover:text-white text-lg leading-none font-bold">&times;</button>
  `;

  // Al hacer clic en la X, elimina el toast inmediatamente
  toast.querySelector("button").addEventListener("click", () => toast.remove());
  c.appendChild(toast);

  // Transcurrido el tiempo de duración, aplica animación de salida y lo elimina del DOM
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
};
