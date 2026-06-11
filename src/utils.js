/* Clave única para identificar y almacenar datos del usuario en el navegador */
const STORAGE_KEY = "cinema_user";

/* 
   Recupera los datos de sesión almacenados.
   Revisa localStorage primero; si no encuentra, prueba en sessionStorage.
*/
const getStorage = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  return sessionStorage.getItem(STORAGE_KEY);
};

/* 
   Guarda los datos del usuario en el mecanismo de almacenamiento adecuado.
   Usa localStorage para sesiones persistentes si 'remember' es true; de lo contrario usa sessionStorage.
*/
const setStorage = (user, remember) => {
  const data = JSON.stringify(user);
  if (remember) {
    localStorage.setItem(STORAGE_KEY, data);
  } else {
    sessionStorage.setItem(STORAGE_KEY, data);
  }
};

/* 
   Guarda la sesión del usuario.
   Extrae solo las propiedades esenciales (id, name, email, role) para mantener la higiene de datos.
*/
export const saveSession = (user, remember = true) => {
  setStorage({ id: user.id, name: user.name, email: user.email, role: user.role }, remember);
};

/* 
   Recupera y analiza el objeto de sesión actual.
   Envuelto en un bloque try/catch para manejar y recuperarse de cadenas JSON corruptas.
*/
export const getSession = () => {
  try {
    const data = getStorage();
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/* 
   Limpia la sesión del usuario por completo.
   Elimina la clave objetivo tanto de localStorage como de sessionStorage para asegurar un cierre de sesión limpio.
*/
export const removeSession = () => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
};

/* 
   Verifica si existe una sesión de usuario.
   Retorna un valor booleano que indica el estado de autenticación.
*/
export const isAuthenticated = () => {
  return !!getSession();
};

/* 
   Determina si el usuario actualmente conectado es administrador.
   Utiliza el encadenamiento opcional para verificar la propiedad role de forma segura.
*/
export const isAdmin = () => {
  return getSession()?.role === "admin";
};

/* 
   Valida el rol del usuario contra un array de roles autorizados.
   Acepta múltiples argumentos y retorna true si el usuario coincide con alguno de ellos.
*/
export const hasRole = (...roles) => {
  const user = getSession();
  return user && roles.includes(user.role);
};
