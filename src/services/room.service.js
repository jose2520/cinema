// Importa el cliente HTTP para realizar peticiones a la API
import { http } from "@/api/http";

// Obtiene todas las salas de cine registradas
export const getRooms = async () => {
  return await http.get("/rooms");
};

// Obtiene una sala específica por su ID
export const getRoomById = async (id) => {
  return await http.get(`/rooms/${id}`);
};

// Crea una nueva sala con estado "active" por defecto
export const createRoom = async (data) => {
  return await http.post("/rooms", { ...data, status: "active" });
};

// Actualiza parcialmente una sala existente usando PATCH
export const updateRoom = async (id, data) => {
  return await http.patch(`/rooms/${id}`, data);
};

// Elimina una sala por su ID
export const deleteRoom = async (id) => {
  return await http.delete(`/rooms/${id}`);
};
