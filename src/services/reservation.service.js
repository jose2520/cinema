// Importa el cliente HTTP para realizar peticiones a la API
import { http } from "@/api/http";

// Obtiene todas las reservas del sistema
export const getReservations = async () => {
  return await http.get("/reservations");
};

// Obtiene una reserva específica por su ID
export const getReservationById = async (id) => {
  return await http.get(`/reservations/${id}`);
};

// Crea una nueva reserva asignando la fecha actual y estado "Pendiente" por defecto
export const createReservation = async (data) => {
  return await http.post("/reservations", {
    ...data,
    reservationDate: new Date().toISOString().split("T")[0],
    status: "Pendiente",
  });
};

// Actualiza parcialmente una reserva existente usando PATCH
export const updateReservation = async (id, data) => {
  return await http.patch(`/reservations/${id}`, data);
};

// Elimina una reserva por su ID
export const deleteReservation = async (id) => {
  return await http.delete(`/reservations/${id}`);
};
