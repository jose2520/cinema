import { navigateTo } from "@/router/router";

export default function notFoundView() {
  return `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <h1 class="text-8xl font-bold text-gray-200 dark:text-gray-800">404</h1>
      <h2 class="text-2xl font-semibold mt-4">Página no encontrada</h2>
      <p class="text-gray-500 dark:text-gray-400 mt-2 text-center max-w-md">
        La ruta que intentas visitar no existe o fue movida.
      </p>
      <button id="goHomeBtn" class="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium">
        Volver al inicio
      </button>
    </div>
  `;
}

notFoundView._init = () => {
  document.querySelector("#goHomeBtn")?.addEventListener("click", () => {
    navigateTo("home");
  });
};
