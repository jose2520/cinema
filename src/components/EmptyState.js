import { icon as i } from "@/utils/icons";

export default function EmptyState({ message = "No hay datos disponibles", icon: iconStr = i("inbox", "w-8 h-8") }) {
  return `
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <span class="mb-3 inline-flex">${iconStr}</span>
      <p class="text-gray-500 dark:text-gray-400 text-sm">${message}</p>
    </div>
  `;
}
