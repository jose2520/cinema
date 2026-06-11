// URL base del servidor JSON Server (API REST simulada)
const API_URL = "http://localhost:3001";

// Función genérica que realiza peticiones HTTP a la API
const request = async (endpoint, options = {}) => {
  try {
    // Ejecuta fetch combinando la URL base con el endpoint y las opciones recibidas
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    // Si la respuesta no es exitosa, lanza un error con el mensaje del servidor
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }
    // Si la respuesta es 204 (Sin contenido), retorna null
    if (response.status === 204) return null;
    // Convierte la respuesta a JSON y la retorna
    return await response.json();
  } catch (error) {
    // Muestra el error en consola y lo relanza para que quien lo invoque lo maneje
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// Objeto exportado con métodos HTTP abreviados (get, post, put, patch, delete)
export const http = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, data) => request(endpoint, { method: "POST", body: JSON.stringify(data) }),
  put: (endpoint, data) => request(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  patch: (endpoint, data) => request(endpoint, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};
