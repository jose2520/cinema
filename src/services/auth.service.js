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

// Obtiene un usuario por su ID
export const getUserById = async (id) => {
  return await http.get(`/users/${id}`);
};

// Busca usuarios por email
export const getUsersByEmail = async (email) => {
  return await http.get(`/users?email=${encodeURIComponent(email)}`);
};

// Crea un nuevo usuario
export const registerUser = async (data) => {
  return await http.post("/users", data);
};

// Actualiza un usuario existente por ID
export const updateUser = async (id, data) => {
  return await http.patch(`/users/${id}`, data);
};
