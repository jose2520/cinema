// Importa el cliente HTTP para realizar peticiones a la API
import { http } from "@/api/http";

// Obtiene todas las funciones y las combina con los datos de su sala correspondiente
export const getScreenings = async () => {
  const screenings = await http.get("/screenings");
  const rooms = await http.get("/rooms");
  return screenings.map((s) => ({
    ...s,
    room: rooms.find((r) => r.id === String(s.roomId)),
  }));
};

// Obtiene una función específica por su ID y le asigna los datos de la sala
export const getScreeningById = async (id) => {
  const screening = await http.get(`/screenings/${id}`);
  const rooms = await http.get("/rooms");
  return { ...screening, room: rooms.find((r) => r.id === String(screening.roomId)) };
};

// Crea una nueva función con capacidad total y asientos disponibles iguales, estado "Activa"
export const createScreening = async (data) => {
  return await http.post("/screenings", {
    ...data,
    totalCapacity: Number(data.totalCapacity),
    availableSeats: Number(data.totalCapacity),
    status: "Activa",
  });
};

// Actualiza parcialmente una función existente usando PATCH
export const updateScreening = async (id, data) => {
  return await http.patch(`/screenings/${id}`, data);
};

// Elimina una función por su ID
export const deleteScreening = async (id) => {
  return await http.delete(`/screenings/${id}`);
};
