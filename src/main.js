/* Importa la hoja de estilos global para aplicar estilos CSS en toda la aplicación */
import "@/style.css";

/* Importa el sistema de enrutamiento personalizado para manejar la navegación del lado del cliente */
import { router } from "@/router/router";

/* 
   Inicializa la aplicación una vez que el documento HTML está completamente cargado y analizado.
   Configura el tema visual y ejecuta el enrutador del lado del cliente.
*/
document.addEventListener("DOMContentLoaded", () => {
  /* Revisa localStorage para ver si el usuario seleccionó previamente el tema oscuro */
  const theme = localStorage.getItem("theme");
  
  /* Aplica la clase 'dark' al elemento raíz (<html>) si el modo oscuro está activo */
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  }
  
  /* Ejecuta la función del router para manejar la vista inicial según la URL */
  router();
});
