// Importa el cliente HTTP para realizar peticiones a la API
import { http } from "@/api/http";

// Busca un usuario por email y contraseña, retorna el primer resultado o lanza error
export const loginUser = async (email, password) => {
  const users = await http.get(`/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
  if (!users || users.length === 0) {
    throw new Error("Credenciales inválidas");
  }
  return users[0];
};

// Obtiene la lista completa de usuarios registrados en el sistema
export const getAllUsers = async () => {
  return await http.get("/users");
};
