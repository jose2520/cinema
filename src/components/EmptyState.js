// Componente que muestra un mensaje visual cuando no hay datos que renderizar
// Recibe un mensaje personalizado y un icono (ambos con valores por defecto)
export default function EmptyState({ message = "No hay datos disponibles", icon = "📭" }) {
  return `
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <span class="text-4xl mb-3">${icon}</span>
      <p class="text-gray-500 dark:text-gray-400 text-sm">${message}</p>
    </div>
  `;
}
