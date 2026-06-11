// Componente de tarjeta para mostrar estadísticas con ícono, título y valor
// Acepta un color para personalizar el fondo del ícono (indigo, emerald, amber, rose, cyan)
export default function StatsCard({ title, value, icon, color = "indigo" }) {
  // Mapa de colores con sus clases Tailwind para modo claro y oscuro
  const colors = {
    indigo: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    rose: "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
    cyan: "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
  };

  return `
    <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-400">${title}</p>
          <p class="text-2xl font-bold mt-1">${value}</p>
        </div>
        <div class="w-12 h-12 rounded-lg flex items-center justify-center text-xl ${colors[color] || colors.indigo}">
          ${icon}
        </div>
      </div>
    </div>
  `;
}
