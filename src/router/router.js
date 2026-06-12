// Funciones utilitarias para verificar autenticación y rol de administrador
import { isAuthenticated, isAdmin } from "@/utils";

// Importación de todas las vistas del SPA
import loginView from "@/views/loginView";
import registerView from "@/views/registerView";
import homeView from "@/views/homeView";
import screeningsView from "@/views/screeningsView";
import screeningFormView from "@/views/screeningFormView";
import reservationsView from "@/views/reservationsView";
import reservationFormView from "@/views/reservationFormView";
import roomsView from "@/views/roomsView";
import roomFormView from "@/views/roomFormView";
import usersView from "@/views/usersView";
import dashboardView from "@/views/dashboardView";
import profileView from "@/views/profileView";
import notFoundView from "@/views/notFound";

// Definición de rutas con su vista asociada y tipo de guardia (guest, auth, admin)
const routes = [
  { path: "login", view: loginView, guard: "guest" },
  { path: "register", view: registerView, guard: "guest" },
  { path: "home", view: homeView, guard: "auth" },
  { path: "screenings", view: screeningsView, guard: "auth" },
  { path: "screenings/create", view: screeningFormView, guard: "admin" },
  { path: "screenings/edit/:id", view: screeningFormView, guard: "admin" },
  { path: "reservations", view: reservationsView, guard: "auth" },
  { path: "reservations/create/:screeningId", view: reservationFormView, guard: "auth" },
  { path: "reservations/edit/:id", view: reservationFormView, guard: "auth" },
  { path: "rooms", view: roomsView, guard: "admin" },
  { path: "rooms/create", view: roomFormView, guard: "admin" },
  { path: "rooms/edit/:id", view: roomFormView, guard: "admin" },
  { path: "users", view: usersView, guard: "admin" },
  { path: "dashboard", view: dashboardView, guard: "admin" },
  { path: "profile", view: profileView, guard: "auth" },
];

// Busca una ruta que coincida con la URL actual, extrayendo parámetros dinámicos (:id, :screeningId)
const matchRoute = (pathname) => {
  // Limpia la ruta eliminando la barra inicial y final
  const clean = pathname.replace(/^\//, "").replace(/\/$/, "");

  // Itera sobre todas las rutas definidas para encontrar una coincidencia
  for (const route of routes) {
    const routeParts = route.path.split("/");
    const pathParts = clean.split("/");

    // Si la cantidad de segmentos no coincide, pasa a la siguiente ruta
    if (routeParts.length !== pathParts.length) continue;

    const params = {};
    let match = true;

    // Compara cada segmento; si comienza con ":" lo trata como parámetro dinámico
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(":")) {
        params[routeParts[i].slice(1)] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }

    if (match) return { route, params };
  }

  return null;
};

// Evalúa el tipo de guardia y retorna una ruta de redirección si no cumple los requisitos
const guardCheck = (guard) => {
  switch (guard) {
    // "auth": requiere estar autenticado, si no redirige al login
    case "auth":
      if (!isAuthenticated()) return "/login";
      break;
    // "admin": requiere autenticación y rol admin, si no redirige según corresponda
    case "admin":
      if (!isAuthenticated()) return "/login";
      if (!isAdmin()) return "/home";
      break;
    // "guest": solo accesible para usuarios no autenticados, redirige al home si ya hay sesión
    case "guest":
      if (isAuthenticated()) return "/home";
      break;
  }
  return null;
};

// Navega programáticamente a una ruta usando History API y dispara el router
export const navigateTo = (path) => {
  // Limpia la ruta de barras y fragmentos
  const clean = path.replace(/^\/?#?\/?/, "");
  const fullPath = `/${clean}`;
  // Solo actualiza si la ruta es diferente a la actual
  if (window.location.pathname !== fullPath) {
    history.pushState(null, "", fullPath);
    router();
  }
};

// Función principal del router: evalúa la URL actual y renderiza la vista correspondiente
export const router = () => {
  const app = document.querySelector("#app");
  const path = window.location.pathname;

  // Si la ruta es la raíz, redirige según si el usuario está autenticado o no
  if (path === "/") {
    navigateTo(isAuthenticated() ? "home" : "login");
    return;
  }

  const match = matchRoute(path);

  // Si no hay coincidencia, muestra la vista de error 404
  if (!match) {
    app.innerHTML = notFoundView();
    setTimeout(() => notFoundView._init?.());
    return;
  }

  const { route, params } = match;
  const redirect = guardCheck(route.guard);

  // Si la guardia requiere redirección, navega a la ruta correspondiente
  if (redirect) {
    navigateTo(redirect);
    return;
  }

  // Renderiza el HTML de la vista en el contenedor principal
  app.innerHTML = route.view(params);

  // Inicializa los eventos de la vista después de que el DOM se haya actualizado
  setTimeout(() => {
    const initFn = route.view._init;
    if (typeof initFn === "function") {
      initFn(params);
    }
  });
};

// Escucha el evento popstate (navegación con botones atrás/adelante) para re-ejecutar el router
window.addEventListener("popstate", router);
