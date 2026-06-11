# Explicación Técnica del Proyecto: CineReserve SPA

## 1. Arquitectura General

CineReserve es una **Single Page Application (SPA)** construida con **JavaScript Vanilla (ES6+)** que gestiona reservas de entradas de cine, funciones y salas. La aplicación sigue una arquitectura modular basada en **vistas + servicios + componentes**, sin framework frontend.

### 1.1 Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| **Vite** | ^8.0.12 | Bundler y dev server con HMR (Hot Module Replacement) |
| **TailwindCSS** | ^4.3.0 | Framework CSS utility-first con variante `dark:` para modo oscuro |
| **JSON Server** | ^1.0.0-beta.15 | API REST simulada que genera recursos CRUD desde `db.json` |
| **Concurrently** | ^10.0.3 | Orquestador que ejecuta Vite y JSON Server en un solo comando |
| **JavaScript ES6+** | — | Módulos nativos (ES Modules) con `import`/`export` |

### 1.2 Flujo de Inicio

```
index.html
  └── <script type="module" src="/src/main.js">
        └── DOMContentLoaded
              ├── Lee localStorage("theme") → aplica clase "dark" a <html>
              └── Ejecuta router()
                    └── Evalúa window.location.pathname
                          ├── "/" → redirige a "/home" o "/login"
                          ├── coincide con ruta → renderiza vista + _init()
                          └── no coincide → muestra 404
```

---

## 2. Desglose por Archivo

### 2.1 `index.html`

**Propósito**: Único archivo HTML servido al navegador. Actúa como contenedor de la SPA.

```html
<body class="bg-gray-50 ... dark:bg-gray-950 dark:text-gray-100">
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
```

| Elemento | Función |
|---|---|
| `<div id="app">` | Contenedor raíz donde el router inyecta el HTML de cada vista |
| `<script type="module">` | Carga `main.js` como módulo ES6, permitiendo `import`/`export` nativos |
| Clases en `<body>` | Colors base y transición suave entre modos claro/oscuro (`transition-colors`) |

No hay etiquetas `<link rel="stylesheet">` porque Vite inyecta TailwindCSS automáticamente desde `src/style.css` gracias al plugin `@tailwindcss/vite`.

---

### 2.2 `package.json`

**Propósito**: Declaración de dependencias, scripts y metadatos del proyecto.

```json
"scripts": {
  "dev": "concurrently \"vite\" \"json-server --watch db.json --port 3001\""
}
```

El script `dev` es clave: `concurrently` lanza dos procesos en paralelo dentro de la misma terminal:
- **Vite** en `http://localhost:5173` (dev server con HMR)
- **JSON Server** en `http://localhost:3001` (API REST con watch sobre `db.json`)

---

### 2.3 `vite.config.js`

**Propósito**: Configura el bundler Vite con el plugin de TailwindCSS y los alias de importación.

```js
plugins: [tailwindcss()]
```

Registra el plugin oficial de TailwindCSS v4 para Vite. Este plugin se encarga de procesar los archivos CSS y generar las utilidades de Tailwind en tiempo de build.

**Aliases definidos**:

| Alias | Resuelve a | Ejemplo de uso |
|---|---|---|
| `@` | `./src` | `import { router } from "@/router/router"` |
| `@views` | `./src/views` | — |
| `@components` | `./src/components` | `import Navbar from "@/components/Navbar"` |
| `@services` | `./src/services` | — |
| `@router` | `./src/router` | — |
| `@utils` | `./src/utils` | — |
| `@api` | `./src/api` | — |
| `@assets` | `./src/assets` | — |

Los alias evitan rutas relativas profundas (`../../components/Navbar`) y centralizan la resolución de imports. Se implementan con `fileURLToPath(new URL(...))` para compatibilidad multiplataforma.

---

### 2.4 `db.json`

**Propósito**: Base de datos simulada que JSON Server expone como API REST. Contiene 4 colecciones.

**Colecciones**:

| Colección | Propósito | Campos clave |
|---|---|---|
| `users` | Usuarios del sistema | `id`, `email`, `password`, `role`, `name` |
| `rooms` | Salas de cine | `id`, `name`, `capacity`, `type`, `status` |
| `screenings` | Funciones de películas | `id`, `movie`, `roomId`, `date`, `time`, `totalCapacity`, `availableSeats`, `status` |
| `reservations` | Reservas de usuarios | `id`, `userId`, `screeningId`, `quantity`, `reservationDate`, `status` |

**Mecanismo de IDs**: JSON Server asigna automáticamente un ID numérico secuencial si el objeto POST no incluye `id`. Si se envía un POST sin `id` en objetos con IDs alfanuméricos (como los usuarios registrados), JSON Server usa `nanoid` internamente para generar IDs únicos.

**Relaciones**:
- `screenings.roomId` → `rooms.id` (relación muchos-a-uno)
- `reservations.userId` → `users.id` 
- `reservations.screeningId` → `screenings.id`

---

### 2.5 `src/main.js`

**Propósito**: Punto de entrada de la aplicación. Configura el tema y arranca el router.

```js
import "@/style.css";
import { router } from "@/router/router";

document.addEventListener("DOMContentLoaded", () => {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  }
  router();
});
```

**Flujo**:
1. Importa `style.css` para que Vite procese TailwindCSS
2. Importa la función `router` desde el sistema de enrutamiento
3. Escucha `DOMContentLoaded` (cuando el HTML inicial está parseado)
4. Lee la preferencia de tema guardada en `localStorage`
5. Si el usuario tenía modo oscuro, agrega la clase `dark` al `<html>` **antes** del primer render para evitar FOUC (Flash of Unstyled Content)
6. Ejecuta `router()` que evalúa la URL actual y renderiza la vista correspondiente

**Por qué es necesario**: Vite agrupa los módulos JS y los carga como scripts diferidos. Sin el `DOMContentLoaded`, el elemento `<div id="app">` podría no existir aún cuando se ejecute `router()`.

---

### 2.6 `src/style.css`

**Propósito**: Archivo CSS principal que importa TailwindCSS y define la variante de dark mode por clase.

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

| Declaración | Efecto |
|---|---|
| `@import "tailwindcss"` | Importa el framework completo. TailwindCSS v4 usa un enfoque CSS-first: no hay archivo `tailwind.config.js` |
| `@custom-variant dark (&:where(.dark, .dark *))` | Sobrescribe el comportamiento por defecto de `dark:` (que usa `prefers-color-scheme`) para que active las utilidades cuando un ancestro tenga la clase `.dark` |

**Explicación del selector `&:where(.dark, .dark *)`**:
- `&` representa el elemento actual
- `.dark` selecciona el elemento si tiene la clase `dark`
- `.dark *` selecciona cualquier descendiente de un elemento con clase `dark`
- `:where()` mantiene la especificidad en cero para que las utilidades de Tailwind sigan teniendo prioridad

Además define la animación `slide-in` usada por las notificaciones Toast (entrada deslizante desde la derecha con opacidad).

---

### 2.7 `src/utils.js`

**Propósito**: Utilidades de gestión de sesión de usuario (almacenamiento, autenticación, roles).

**Constantes y variable interna**:
```js
const STORAGE_KEY = "cinema_user";
```

**Funciones internas privadas**:

| Función | Comportamiento |
|---|---|
| `getStorage()` | Retorna el string JSON desde `localStorage`; si no existe, prueba `sessionStorage` |
| `setStorage(user, remember)` | Serializa a JSON y guarda en `localStorage` si `remember=true`, o en `sessionStorage` si no |

**Funciones exportadas**:

| Función | Firma | Lógica interna |
|---|---|---|
| `saveSession` | `(user, remember = true) => void` | Extrae solo `{ id, name, email, role }` del objeto user (nunca guarda password) y llama a `setStorage` |
| `getSession` | `() => object \| null` | Obtiene el string con `getStorage()`, lo parsea con `JSON.parse` envuelto en try/catch. Si hay error de parseo retorna `null` |
| `removeSession` | `() => void` | Elimina la clave `STORAGE_KEY` de ambos almacenamientos |
| `isAuthenticated` | `() => boolean` | `!!getSession()` — doble negación para convertir a booleano |
| `isAdmin` | `() => boolean` | Usa optional chaining: `getSession()?.role === "admin"`. Si no hay sesión, `?.` retorna `undefined` y la comparación es `false` |
| `hasRole` | `(...roles) => boolean` | Obtiene el usuario y verifica si su `role` está incluido en el array `roles` usando `Array.includes()` |

**Dual storage**: Usar dos tipos de storage permite que la sesión expire al cerrar el navegador si el usuario no marcó "Recordar sesión" (sessionStorage se borra al cerrar la pestaña), o que persista entre sesiones si lo marcó (localStorage).

---

### 2.8 `src/api/http.js`

**Propósito**: Cliente HTTP genérico que envuelve `fetch` y centraliza llamadas a la API.

```js
const API_URL = "http://localhost:3001";
```

**Función interna `request`**:
```
async request(endpoint, options = {})
  → fetch(`${API_URL}${endpoint}`, { headers: { Content-Type: "application/json" }, ...options })
  → Si !response.ok → extrae texto del error y lanza Error
  → Si status 204 → retorna null
  → Sino → retorna response.json()
  → En catch → console.error + relanza error
```

**Objeto exportado `http`**:

| Método | Firma | Equivalente HTTP |
|---|---|---|
| `http.get` | `(endpoint) => request(endpoint)` | GET sin body |
| `http.post` | `(endpoint, data) => request(endpoint, { method: "POST", body: JSON.stringify(data) })` | POST con body JSON |
| `http.put` | `(endpoint, data) => request(endpoint, { method: "PUT", body: JSON.stringify(data) })` | PUT con body JSON |
| `http.patch` | `(endpoint, data) => request(endpoint, { method: "PATCH", body: JSON.stringify(data) })` | PATCH con body JSON |
| `http.delete` | `(endpoint) => request(endpoint, { method: "DELETE" })` | DELETE sin body |

**Manejo de errores**: La función `request` captura errores de red (fetch rejected) y errores HTTP (response no-ok). En ambos casos loggea en consola y relanza el error para que quien invoca lo maneje con try/catch.

---

### 2.9 `src/router/router.js`

**Propósito**: Sistema de enrutamiento SPA usando History API con soporte de parámetros dinámicos y guards de acceso.

**Constante `routes`**: Array de 14 objetos con la estructura:
```js
{ path: "screenings/edit/:id", view: screeningFormView, guard: "admin" }
```

#### 2.9.1 `matchRoute(pathname)`
```
Input: "/reservations/edit/5"
Output: { route: {...}, params: { id: "5" } }
```
Algoritmo:
1. Normaliza la URL: elimina `/` inicial y final
2. Divide en segmentos: `["reservations", "edit", "5"]`
3. Itera sobre `routes` comparando segmento a segmento
4. Si un segmento de ruta empieza con `:`, lo trata como parámetro variable y lo captura en el objeto `params`
5. Si coinciden todos los segmentos (incluyendo cantidad), retorna el match
6. Si no hay match en ninguna ruta, retorna `null`

#### 2.9.2 `guardCheck(guard)`
```
Input: "admin"
Output: "/login" (si no autenticado) o "/home" (si no es admin) o null (ok)
```
Usa un `switch` para evaluar el tipo de guardia:
- `"auth"`: `!isAuthenticated()` → `"/login"`
- `"admin"`: `!isAuthenticated()` → `"/login"`, `!isAdmin()` → `"/home"`
- `"guest"`: `isAuthenticated()` → `"/home"`

#### 2.9.3 `navigateTo(path)`
Envuelve `history.pushState` y dispara `router()`. Previene navegaciones a la misma ruta comparando `window.location.pathname`:
```js
if (window.location.pathname !== fullPath) {
  history.pushState(null, "", fullPath);
  router();
}
```

#### 2.9.4 `router()` (función principal)
1. Obtiene `window.location.pathname`
2. Si es `"/"`, redirige a `"/home"` o `"/login"` según autenticación
3. Ejecuta `matchRoute(path)` → si no hay match, renderiza `notFoundView` y llama a `_init`
4. Ejecuta `guardCheck(route.guard)` → si hay redirect, navega
5. Renderiza el HTML: `app.innerHTML = route.view(params)`
6. Encola en `setTimeout` la llamada a `route.view._init(params)` para ejecutarse después del render

#### 2.9.5 `popstate`
```js
window.addEventListener("popstate", router);
```
Escucha el evento `popstate` que se dispara cuando el usuario navega con los botones atrás/adelante del navegador, re-ejecutando el router para actualizar la vista.

---

### 2.10 `src/components/Navbar.js`

**Propósito**: Barra de navegación principal con menús contextuales según el rol del usuario, toggle de tema oscuro y cierre de sesión.

**Flujo de renderizado**:
```
Navbar() es llamado desde ${Navbar()} dentro del template de cada vista
  → Obtiene sesión y tema actual
  → Sincroniza clase "dark" en <html> según localStorage
  → Construye HTML con:
      - Logo / nombre "CineReserve"
      - Enlaces para usuarios normales: Inicio, Cartelera, Mis Reservas
      - Enlaces extra para admin: Nueva Función, Salas, Dashboard, Usuarios
      - Botón toggle ☀️/🌙
      - Nombre del usuario + badge de rol
      - Botón "Salir"
  → setTimeout (post-render):
      - Asigna event listeners a todos los [data-nav]
      - Asigna logout a #logoutBtn
      - Asigna toggle de dark mode a #themeToggle
```

**Tema oscuro**:
- Sincronización bidireccional entre `localStorage` y la clase `dark` en `<html>`
- El icono del botón se determina por `document.documentElement.classList.contains("dark")`:
  - Si está en modo oscuro → muestra ☀️ (sol = cambiar a claro)
  - Si está en modo claro → muestra 🌙 (luna = cambiar a oscuro)
- Al hacer clic, togglea la clase, persiste en localStorage y actualiza el texto del botón

**Menú responsive**: Los enlaces de navegación se muestran en dos niveles:
- `hidden md:flex` → visible en pantallas medianas/grandes (escritorio)
- `md:hidden` → visible solo en móviles, con scroll horizontal (`overflow-x-auto`)

---

### 2.11 `src/components/Toast.js`

**Propósito**: Sistema de notificaciones no intrusivas con auto-destrucción.

**Singleton del contenedor**:
```js
let container = null;
```
El contenedor se crea una sola vez y se reutiliza. Se posiciona `fixed top-4 right-4 z-50` para superponerse al contenido.

**Función exportada `showToast(message, type, duration)`**:

| Parámetro | Valores | Por defecto |
|---|---|---|
| `message` | String | — |
| `type` | `"success"`, `"error"`, `"warning"`, `"info"` | `"info"` |
| `duration` | Número (ms) | `4000` |

**Ciclo de vida de un toast**:
1. Crea un `<div>` con color según el tipo y clase `animate-slide-in`
2. Inserta el mensaje y un botón `×` para cierre manual
3. Agrega el toast al contenedor
4. Tras `duration` ms, aplica animación de salida (opacity 0 + translateX)
5. Elimina el elemento del DOM tras 300ms (duración de la animación)

---

### 2.12 `src/components/Modal.js`

**Propósito**: Modal de confirmación genérico, inyectado al `<body>` como HTML.

**Props**:
| Prop | Descripción |
|---|---|
| `id` | Identificador único del modal |
| `title` | Título en negrita |
| `content` | Texto descriptivo |
| `confirmText` | Texto del botón de confirmación (default: "Confirmar") |
| `cancelText` | Texto del botón de cancelar (default: "Cancelar") |
| `onConfirm` | Callback ejecutado al confirmar |

**Mecanismo**: La función retorna el HTML del modal. En un `setTimeout` (post-inserción), asigna event listeners:
- Clic en overlay (`modal-overlay`) → cierra
- Clic en botón cancelar → cierra
- Clic en botón confirmar → ejecuta `onConfirm` y cierra

El cierre elimina el elemento del DOM con `modal.remove()`.

---

### 2.13 `src/components/StatsCard.js`

**Propósito**: Tarjeta visual para mostrar una estadística con ícono, valor y título.

```js
StatsCard({ title: "Reservas", value: 42, icon: "🎟️", color: "emerald" })
```

**Colores predefinidos**: `indigo`, `emerald`, `amber`, `rose`, `cyan`. Cada color define clases Tailwind para el fondo del ícono en modo claro y oscuro.

---

### 2.14 `src/components/EmptyState.js`

**Propósito**: Componente de estado vacío que se muestra cuando no hay datos que renderizar.

```js
EmptyState({ message: "No hay funciones", icon: "🎬" })
```

Renderiza un contenedor centrado con el ícono grande y el mensaje debajo. Se usa en todas las vistas de listado mientras cargan datos o cuando no hay resultados.

---

### 2.15 `src/services/auth.service.js`

**Propósito**: Servicio de autenticación y consulta de usuarios.

```js
loginUser(email, password)
  → GET /users?email=...&password=...
  → Si array vacío, lanza "Credenciales inválidas"
  → Retorna users[0]

getAllUsers()
  → GET /users
  → Retorna array completo
```

**Nota de seguridad**: La contraseña se envía como query parameter en la URL. Esto es una limitación de JSON Server (que no soporta body en GET). En producción debería usarse POST con body cifrado y autenticación por token.

---

### 2.16 `src/services/reservation.service.js`

**Propósito**: CRUD de reservas.

| Función | Método HTTP | Comportamiento adicional |
|---|---|---|
| `getReservations()` | GET | — |
| `getReservationById(id)` | GET | — |
| `createReservation(data)` | POST | Asigna `reservationDate = hoy` en ISO y `status = "Pendiente"` |
| `updateReservation(id, data)` | PATCH | Actualización parcial |
| `deleteReservation(id)` | DELETE | — |

---

### 2.17 `src/services/room.service.js`

**Propósito**: CRUD de salas.

| Función | Método HTTP | Comportamiento adicional |
|---|---|---|
| `getRooms()` | GET | — |
| `getRoomById(id)` | GET | — |
| `createRoom(data)` | POST | Asigna `status: "active"` por defecto |
| `updateRoom(id, data)` | PATCH | — |
| `deleteRoom(id)` | DELETE | — |

---

### 2.18 `src/services/screening.service.js`

**Propósito**: CRUD de funciones con enriquecimiento de datos de sala.

**Particularidad**: `getScreenings()` y `getScreeningById(id)` realizan **dos** peticiones HTTP paralelas: una a `/screenings` y otra a `/rooms`. Luego combinan los resultados usando `Array.find()` para asociar cada screening con su sala mediante `roomId`.

```js
getScreenings() → Promise.all([GET /screenings, GET /rooms])
                → screenings.map(s => ({ ...s, room: rooms.find(r => r.id === s.roomId) }))
```

**Creación de función**: `createScreening(data)` asigna automáticamente:
- `totalCapacity` y `availableSeats` desde la capacidad de la sala (recibida en `data`)
- `status = "Activa"`

---

### 2.19 `src/views/loginView.js`

**Propósito**: Formulario de inicio de sesión.

**Template**: Renderiza un formulario centrado con:
- Campos de email y password
- Checkbox "Recordar sesión" (marcado por defecto)
- Botón "Ingresar"
- Enlace a registro
- Tarjetas informativas con credenciales de prueba (admin y user)

**_Init**: Asigna evento `submit` al formulario:
1. Previene envío por defecto
2. Oculta errores previos
3. Valida campos vacíos
4. Deshabilita el botón y cambia texto a "Ingresando..."
5. Llama a `loginUser(email, password)` del servicio de autenticación
6. Si éxito: guarda sesión con `saveSession`, muestra toast de bienvenida, navega a `/home`
7. Si error: muestra mensaje en `#loginError`, reactiva botón

**Doble storage**: El checkbox "Recordar sesión" determina si se usa `localStorage` o `sessionStorage` al guardar la sesión.

---

### 2.20 `src/views/registerView.js`

**Propósito**: Registro de nuevos usuarios.

**Template**: Formulario con nombre, email, contraseña y confirmación de contraseña. Enlace a login para usuarios existentes.

**_Init**: Validaciones en cliente:
1. Todos los campos obligatorios
2. Contraseña mínimo 6 caracteres
3. Contraseñas deben coincidir
4. Verifica email duplicado: `GET /users?email=...` — si existe, lanza error
5. Crea usuario: `POST /users` con `role: "user"` (los usuarios registrados nunca son admin)
6. Si éxito: toast de cuenta creada, redirige a login

**Asignación de ID**: La petición POST a JSON Server no incluye `id`. El servidor genera automáticamente un ID alfanumérico único usando `nanoid` (librería interna de JSON Server). Esto es visible en `db.json` donde usuarios registrados tienen IDs como `"gdWCWdXSfFk"` mientras que los precargados tienen IDs numéricos.

---

### 2.21 `src/views/homeView.js`

**Propósito**: Panel de control principal con resumen de datos.

**Template**: 
- Saludo personalizado con nombre del usuario y badge de rol
- Grid de 4 tarjetas de estadísticas (contenido cargado dinámicamente)
- Tarjetas de acceso rápido según rol:
  - **Admin**: Nueva Función, Gestionar Salas, Dashboard
  - **User**: Ver Cartelera, Mis Reservas
- Sección "Reservas Recientes" (últimas 5)

**_Init** (asíncrono):
1. Carga en paralelo: `getScreenings()`, `getReservations()`, `getRooms()`
2. Calcula estadísticas según el rol:
   - **Admin**: funciones activas/totales, total reservas, confirmadas, cantidad de salas
   - **User**: mis reservas, funciones disponibles, asientos totales, salas
3. Renderiza las 4 `StatsCard` en el grid
4. Filtra las últimas 5 reservas (del usuario o de todo el sistema según rol)
5. Renderiza la lista de reservas recientes o `EmptyState` si no hay

---

### 2.22 `src/views/dashboardView.js`

**Propósito**: Dashboard administrativo con estadísticas detalladas (solo admin).

**Template**:
- Título y subtítulo
- 4 tarjetas de estadísticas (skeleton loader animado mientras carga)
- Gráfico de ocupación por sala (barras de progreso)
- Gráfico de distribución de reservas (confirmadas, pendientes, canceladas)
- Tabla completa de funciones con ocupación

**_Init** (asíncrono):
1. Carga en paralelo screenings, reservas y salas
2. Calcula: funciones activas, reservas por estado, capacidad total, asientos vendidos, tasa de ocupación
3. Renderiza StatsCards
4. Por cada sala, calcula porcentaje de ocupación sumando asientos ocupados en todas sus funciones y renderiza barra de progreso
5. Renderiza distribución de reservas (tres barras con colores: verde/ámbar/rojo)
6. Renderiza tabla HTML de todas las funciones con columnas: Película, Sala, Fecha, Hora, Disponibles, Ocupación (barra + %), Estado

---

### 2.23 `src/views/screeningsView.js`

**Propósito**: Cartelera de funciones con búsqueda y filtros.

**Template**: Título, botón "+ Nueva Función" (solo admin), inputs de búsqueda/filtro y grid de tarjetas.

**Filtros**:
| Filtro | Tipo | Comportamiento |
|---|---|---|
| `#searchScreening` | Texto (input) | Filtra por nombre de película (case-insensitive) |
| `#filterDate` | Date (input) | Filtra por fecha exacta |
| `#filterStatus` | Select | "Todos", "Activas", "Canceladas" |

**Renderizado** (función `render`):
- Filtra el array `screenings` combinando los tres criterios
- Para cada función, renderiza una tarjeta con:
  - Imagen de la película (con fallback a placeholder y `onerror` para mostrar 🎬 si la imagen no carga)
  - Nombre, estado (badge), fecha, hora, sala, asientos disponibles
  - Botón "Reservar" (si está activa y tiene asientos) o "Agotado"/"Cancelada" (deshabilitado)
  - Botones de editar y eliminar (solo admin)
- Las funciones canceladas se muestran con `opacity-60`

**_Init**: Carga `getScreenings()`, renderiza, y asigna event listeners a filtros (input, change) para re-renderizar en tiempo real.

---

### 2.24 `src/views/screeningFormView.js`

**Propósito**: Formulario de creación/edición de funciones.

**Template**: Formulario con campos:
- Película (text)
- Sala (select, poblado dinámicamente)
- Fecha (date) y Hora (time)
- Estado (select, solo visible en edición)

**_Init**:
1. Carga las salas con `getRooms()` y llena el `<select>`
2. Si es edición (`params.id` existe), carga la función con `getScreeningById()` y precarga todos los campos
3. Al enviar:
   - Obtiene la sala seleccionada para conocer su capacidad
   - Construye objeto `data` con movie, roomId, date, time
   - Si es edición: incluye `status` y llama a `updateScreening()`
   - Si es creación: asigna `totalCapacity` y `availableSeats` desde la capacidad de la sala, llama a `createScreening()`

**Flujo de validación**: La capacidad de la sala se obtiene directamente de la API (`GET /rooms/:id`) dentro del submit, no desde el select (que solo muestra nombre/tipo).

---

### 2.25 `src/views/reservationsView.js`

**Propósito**: Listado de reservas con filtro por estado y acciones contextuales.

**Filtro**: Select con opciones "Todos los estados", "Pendiente", "Confirmada", "Cancelada".

**Renderizado** (función `render`):
- Filtra reservas según rol (admin ve todas, user solo las suyas) y según estado seleccionado
- Por cada reserva renderiza:
  - Nombre de la película (buscando el screening correspondiente)
  - Badge de estado con color: Pendiente (ámbar), Confirmada (verde), Cancelada (rojo)
  - Detalles: fecha, hora, sala, cantidad de asientos
  - Acciones según contexto:
    - Admin: botones "✅ Aprobar" y "❌ Rechazar" (si está Pendiente)
    - User dueño: botón "✏️ Editar" (si está Pendiente) y "🗑️ Cancelar" (si no está Cancelada)

**Eventos**:
- `[data-cancel]`: Abre un Modal de confirmación. Si confirma, PATCH a la reserva con `status: "Cancelada"` y PATCH a la función para devolver los asientos
- `[data-approve]`: PATCH a la reserva con `status: "Confirmada"` (sin devolución de asientos)
- `[data-reject]`: PATCH a la reserva con `status: "Cancelada"` + devolución de asientos

---

### 2.26 `src/views/reservationFormView.js`

**Propósito**: Formulario de creación/edición de reservas.

**Template**: Formulario simple con:
- Información de la función (cargada dinámicamente)
- Input numérico para cantidad de asientos (min 1, max dinámico)
- Botón submit y cancelar

**_Init** (asíncrono):
1. **Modo creación** (`params.screeningId`):
   - Carga la función con `getScreeningById(screeningId)`
   - Valida que la función esté "Activa" y tenga asientos disponibles
   - Muestra info de la función y establece máximo = `availableSeats`
2. **Modo edición** (`params.id`):
   - Carga la reserva con `getReservationById(id)`
   - Verifica permisos (solo el dueño o admin pueden editar)
   - Carga la función asociada
   - Precarga la cantidad actual y establece máximo = `availableSeats + cantidadActual` (porque los asientos actuales están "ocupados" por esta reserva)

**Submit**:
- **Creación**: `createReservation()` + PATCH a screening para restar asientos
- **Edición**: Calcula diferencia (`nueva - vieja`), si es positiva verifica disponibilidad, luego `updateReservation()` + PATCH a screening ajustando asientos

---

### 2.27 `src/views/roomsView.js`

**Propósito**: Gestión de salas (solo admin). Grid de tarjetas con opciones de editar y eliminar.

**Template**: Título + botón "+ Nueva Sala" + grid de tarjetas.

**Renderizado** (función interna `load`):
1. Obtiene salas con `getRooms()`
2. Renderiza cada sala como tarjeta con: nombre, badge de estado (Activa/Inactiva), tipo, capacidad
3. Botones: "✏️ Editar" (navega a `/rooms/edit/:id`) y "🗑️ Eliminar" (abre modal)

**Eliminación**: Modal de confirmación con `Modal()`. Al confirmar, llama a `deleteRoom(id)` y re-ejecuta `load()` para refrescar el grid.

---

### 2.28 `src/views/roomFormView.js`

**Propósito**: Formulario de creación/edición de salas.

**Template**: Nombre, Capacidad (number), Tipo (select: 2D/3D/IMAX), Estado (select: Activa/Inactiva — solo en edición).

**_Init**:
- Si es edición: carga la sala con `getRoomById(id)`, precarga todos los campos incluyendo estado
- Al submit: construye `{ name, capacity, type }`, agrega `status` si es edición, llama a `createRoom()` o `updateRoom()`

---

### 2.29 `src/views/usersView.js`

**Propósito**: Listado de usuarios registrados en tabla HTML (solo admin).

**_Init**: Obtiene todos los usuarios con `getAllUsers()` y renderiza una tabla con columnas: ID, Nombre, Email, Rol. El rol se muestra como badge con estilo diferenciado (índigo para admin, gris para user). No hay acciones disponibles sobre usuarios (solo consulta).

---

### 2.30 `src/views/notFound.js`

**Propósito**: Página 404 para rutas no existentes.

Renderiza un número grande "404", mensaje descriptivo y un botón "Volver al inicio". El `_init` asigna el event listener al botón que navega a `"/home"`.

**Nota**: Cuando el router detecta que no hay ruta coincidente, renderiza `notFoundView()` y ejecuta su `_init` en un `setTimeout`, igual que las rutas normales.

---

## 3. Flujo de Datos Típico

### Ejemplo: Crear una Reserva

```
Usuario hace clic en "Reservar" en la cartelera
  → navigateTo("reservations/create/1")
    → router()
      → matchRoute → { route: reservationFormView, params: { screeningId: "1" } }
      → app.innerHTML = reservationFormView({ screeningId: "1" })
        → Navbar() + formulario con placeholder
      → setTimeout → reservationFormView._init({ screeningId: "1" })
        → getScreeningById("1")  ← GET /screenings/1 + GET /rooms
        → Renderiza datos de la función en el formulario
        → Usuario ingresa cantidad y envía
          → createReservation({ userId, screeningId, quantity })
            ← POST /reservations → { ...data, status: "Pendiente" }
          → PATCH /screenings/1 { availableSeats: availableSeats - quantity }
          → showToast("Reserva creada con éxito")
          → navigateTo("reservations")
```

---

## 4. Estructura de Archivos

```
/
├── index.html                  # Único HTML, <div id="app"> como contenedor
├── package.json                # Dependencias (Vite, Tailwind, JSON Server)
├── vite.config.js              # Plugin Tailwind + aliases @
├── db.json                     # Base de datos simulada (users, rooms, screenings, reservations)
└── src/
    ├── main.js                 # Entry point: tema oscuro + router()
    ├── style.css               # @import tailwindcss + @custom-variant dark
    ├── utils.js                # Session storage, autenticación, roles
    ├── api/
    │   └── http.js             # Wrapper de fetch (GET, POST, PUT, PATCH, DELETE)
    ├── router/
    │   └── router.js           # History API routing + guards + params dinámicos
    ├── services/
    │   ├── auth.service.js     # loginUser(), getAllUsers()
    │   ├── reservation.service.js  # CRUD reservas + fecha/status automáticos
    │   ├── room.service.js     # CRUD salas
    │   └── screening.service.js    # CRUD funciones + join con sala
    ├── components/
    │   ├── Navbar.js           # Navegación responsive con menú por rol y dark toggle
    │   ├── StatsCard.js        # Tarjeta de estadística con ícono y color
    │   ├── Modal.js            # Modal de confirmación (overlay + botones)
    │   ├── EmptyState.js       # Mensaje de "sin datos" con ícono
    │   └── Toast.js            # Notificaciones toast animadas
    └── views/
        ├── loginView.js        # Login con remember-me y credenciales de prueba
        ├── registerView.js     # Registro con validaciones en cliente
        ├── homeView.js         # Panel de control con stats y accesos rápidos
        ├── screeningsView.js   # Cartelera con búsqueda y filtros
        ├── screeningFormView.js # Crear/editar funciones
        ├── reservationsView.js # Listado de reservas con acciones por rol
        ├── reservationFormView.js # Crear/editar reservas con control de asientos
        ├── roomsView.js        # Grid de salas con editar/eliminar
        ├── roomFormView.js     # Crear/editar salas
        ├── usersView.js        # Tabla de usuarios (solo admin)
        ├── dashboardView.js    # Dashboard con ocupación por sala y distribución
        └── notFound.js         # Página 404 con botón de retorno
```

---

## 5. Decisiones Técnicas y Deuda Técnica

### 5.1 Aciertos
- **Sin framework**: Cero dependencias de runtime pesadas, total control del ciclo de vida
- **Aliases con Vite**: Importaciones limpias (`@/components/Navbar` en lugar de `../../components/Navbar`)
- **Server simulado**: JSON Server permite prototipado rápido sin backend real
- **Patrón vista + `_init`**: Separación clara entre template y lógica sin clases ni bundlers extra
- **setTimeout para eventos**: Garantiza que el DOM exista antes de bindear event listeners, evitando null references
- **Dual storage**: localStorage + sessionStorage para sesión persistente o efímera

### 5.2 Deuda Técnica Observable
- **Lógica de negocio en vistas**: Las reglas de actualización de `availableSeats` están en `reservationFormView.js` y `reservationsView.js` en lugar de en el servicio
- **Código repetido en `data-nav`**: Cada vista re-asigna los mismos event listeners a `[data-nav]`, cuando podría hacerse una sola vez con event delegation global
- **Fechas locales vs UTC**: `reservationDate` usa `new Date().toISOString().split("T")[0]` que depende de la zona horaria del cliente
- **Sin capa de caché**: Cada navegación a una vista dispara peticiones HTTP nuevas
- **Error handling inconsistente**: Algunas vistas usan try/catch con `showToast`, otras silencian errores
- **Tipado**: No hay TypeScript ni JSDoc, todo el tipado es implícito
- **Fetch directo en vistas**: Algunas vistas (registerView, reservationFormView) usan `fetch()` directamente en lugar del servicio correspondiente

---

## 6. Cómo Ejecutar

```bash
npm install        # Instalar dependencias
npm run dev        # Inicia Vite (:5173) + JSON Server (:3001)
```

### Credenciales de Prueba

| Rol | Email | Password |
|---|---|---|
| Admin | admin@test.com | A123456 |
| User | user@test.com | A123456 |
