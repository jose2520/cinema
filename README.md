# CineReserve - Sistema de Reservas de Cine SPA

Aplicación de página única (SPA) para gestionar funciones de cine, reservas de asientos y administración de salas. Construida con JavaScript Vanilla, Vite, TailwindCSS y JSON Server.

## Descripción

CineReserve es una plataforma web que permite a las cadenas de cines gestionar sus funciones y reservas de entradas de forma digital. El sistema cuenta con dos roles de usuario (admin y user) con control de acceso basado en roles, persistencia de sesión y operaciones CRUD completas sobre reservas, funciones y salas.

### Problema

Una cadena de cines experimentaba:
- Sobreventa de asientos
- Dificultad para consultar disponibilidad de funciones
- Falta de control sobre las reservas de los clientes
- Poca visibilidad para los administradores sobre la ocupación de las salas

Esta aplicación soluciona estos problemas proporcionando una plataforma digital centralizada.

## Tecnologías Utilizadas

- **JavaScript ES6+** — Arquitectura modular con módulos ES nativos
- **Vite** — Herramienta de build y servidor de desarrollo
- **TailwindCSS v4** — Framework CSS utility-first
- **JSON Server** — API REST simulada
- **Concurrently** — Ejecuta Vite y JSON Server simultáneamente
- **HTML5 / CSS3** — Estructura y estilos

## Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd <project-folder>

# Instalar dependencias
npm install
```

## Ejecutar el Proyecto

```bash
# Inicia Vite y JSON Server concurrentemente
npm run dev
```

Esto iniciará:
- **Vite** en `http://localhost:5173`
- **JSON Server** en `http://localhost:3001`

### Ejecutar JSON Server por separado

```bash
npx json-server --watch db.json --port 3001
```

## Usuarios de Prueba

| Rol     | Correo             | Contraseña |
| ------- | ------------------ | ---------- |
| Admin   | admin@test.com     | A123456    |
| User    | user@test.com      | A123456    |
| User 2  | user2@test.com     | A123456    |

## Estructura del Proyecto

```
src/
├── api/
│   └── http.js                # Cliente HTTP (wrapper de Fetch)
├── components/
│   ├── EmptyState.js           # Marcador de estado vacío
│   ├── Modal.js                # Modal de confirmación
│   ├── Navbar.js               # Barra de navegación con enlaces según el rol
│   ├── StatsCard.js            # Componente de tarjeta de estadísticas
│   └── Toast.js                # Sistema de notificaciones toast
├── router/
│   └── router.js               # Router SPA con guards de acceso
├── services/
│   ├── auth.service.js         # Llamadas API de autenticación
│   ├── reservation.service.js  # Llamadas CRUD de reservas
│   ├── room.service.js         # Llamadas CRUD de salas
│   └── screening.service.js    # Llamadas CRUD de funciones
├── views/
│   ├── dashboardView.js        # Dashboard de administrador con estadísticas
│   ├── homeView.js             # Página de inicio con paneles según el rol
│   ├── loginView.js            # Formulario de inicio de sesión
│   ├── notFound.js             # Página 404
│   ├── registerView.js         # Formulario de registro de usuario
│   ├── reservationFormView.js  # Formulario de crear/editar reserva
│   ├── reservationsView.js     # Listado de reservas con filtros
│   ├── roomFormView.js         # Formulario de crear/editar sala
│   ├── roomsView.js            # Gestión de salas (admin)
│   ├── screeningFormView.js    # Formulario de crear/editar función
│   └── screeningsView.js       # Cartelera con búsqueda y filtros
├── main.js                     # Punto de entrada de la aplicación
├── style.css                   # Estilos globales (TailwindCSS)
└── utils.js                    # Utilidades de autenticación (sesión, roles)
```

## Permisos por Rol

### Admin
- Ver todas las reservas
- Aprobar o cancelar cualquier reserva
- Crear, editar y eliminar funciones
- Crear, editar y eliminar salas
- Ver todos los usuarios registrados
- Ver dashboard con estadísticas de ocupación
- CRUD completo sobre cualquier reserva

### User
- Ver cartelera de funciones
- Crear reservas para funciones disponibles
- Ver solo sus propias reservas
- Cancelar sus propias reservas
- Editar sus propias reservas pendientes
- **No puede** gestionar funciones, salas ni ver reservas de otros usuarios

## Reglas de Negocio

- Las reservas no pueden exceder los asientos disponibles
- Una función cancelada no puede recibir nuevas reservas
- Los usuarios solo pueden modificar reservas activas (pendientes)
- Las reservas canceladas no se pueden reactivar
- El admin puede modificar cualquier reserva
- Los asientos disponibles se actualizan automáticamente al crear o cancelar una reserva

## Decisiones Técnicas

### Arquitectura
- **Enrutamiento History API** (`/path`) para URLs limpias sin fragmentos hash
- **Patrón Vista + Controlador**: Cada vista exporta una función de renderizado y un método estático `_init` para el bindeo de eventos, manteniendo plantillas y lógica en el mismo archivo
- **Servicios modulares**: Cada dominio (auth, screening, room, reservation) tiene su propio archivo de servicio, separando las preocupaciones de la API de la lógica de UI
- **Librería de componentes**: Componentes UI reutilizables (Toast, Modal, StatsCard, EmptyState) construidos como funciones puras que retornan strings HTML

### Persistencia de Sesión
- `localStorage` se usa cuando "Recordar sesión" está marcado
- `sessionStorage` se usa cuando "Recordar sesión" no está marcado — la sesión expira al cerrar la pestaña
- Los datos de sesión se limpian al cerrar sesión

### Guards de Rutas
- Las rutas están protegidas a nivel de router usando una propiedad `guard`
- Tres tipos de guardia: `guest` (redirige usuarios autenticados al inicio), `auth` (redirige usuarios no autenticados al login), `admin` (redirige usuarios no admin al inicio)

### Capa de Datos
- `json-server` proporciona una API REST completa con GET, POST, PUT, PATCH, DELETE
- Los asientos se actualizan de forma optimista en el servidor cuando se crean/cancelan reservas

### Estilos
- TailwindCSS v4 para diseño responsive utility-first
- Soporte de modo oscuro con detección de preferencia del sistema y toggle manual
- Notificaciones toast para retroalimentación al usuario

## Características Adicionales

- **Dashboard con estadísticas** — Tasas de ocupación, distribución de reservas, rendimiento por sala
- **Modo oscuro** — Botón de cambio en la barra de navegación con persistencia en localStorage
- **Búsqueda y filtros** — Búsqueda de funciones por nombre, filtro por fecha y estado
- **Notificaciones toast** — Retroalimentación no intrusiva para todas las operaciones
- **Registro de usuarios** — Formulario de auto-registro para nuevas cuentas
- **Imágenes de pósters** — Visualización de pósters de películas en las tarjetas de funciones

## Endpoints de la API

| Método | Endpoint              | Descripción               |
| ------ | --------------------- | ------------------------- |
| GET    | /users                | Listar todos los usuarios |
| POST   | /users                | Crear usuario (registro)  |
| GET    | /users?email=&password= | Autenticar usuario      |
| GET    | /rooms                | Listar todas las salas    |
| GET    | /rooms/:id            | Obtener sala por ID       |
| POST   | /rooms                | Crear sala                |
| PATCH  | /rooms/:id            | Actualizar sala           |
| DELETE | /rooms/:id            | Eliminar sala             |
| GET    | /screenings           | Listar todas las funciones|
| GET    | /screenings/:id       | Obtener función por ID    |
| POST   | /screenings           | Crear función             |
| PATCH  | /screenings/:id       | Actualizar función        |
| DELETE | /screenings/:id       | Eliminar función          |
| GET    | /reservations         | Listar todas las reservas |
| GET    | /reservations/:id     | Obtener reserva por ID    |
| POST   | /reservations         | Crear reserva             |
| PATCH  | /reservations/:id     | Actualizar reserva        |
| DELETE | /reservations/:id     | Eliminar reserva          |
