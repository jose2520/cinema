import Navbar from "@/components/Navbar";
import { getSession, saveSession } from "@/utils";
import { updateUser, getUserById } from "@/services/auth.service";
import { showToast } from "@/components/Toast";
import { icon } from "@/utils/icons";

export default function profileView() {
  const user = getSession();

  return `
    ${Navbar()}
    <div class="max-w-2xl mx-auto px-4 py-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Mi Perfil</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Gestiona tu información personal</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div class="flex flex-col items-center mb-6">
          <div id="avatarPreview" class="w-24 h-24 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-3">
            ${icon("loader-circle", "w-8 h-8 animate-spin")}
          </div>
          <label class="cursor-pointer px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium transition-colors">
            ${icon("camera", "w-4 h-4 inline")} Cambiar Foto
            <input type="file" id="photoInput" accept="image/*" class="hidden">
          </label>
        </div>

        <form id="profileForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input type="text" name="name" value="${user?.name || ""}" required
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" name="email" value="${user?.email || ""}" required
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nueva Contraseña</label>
            <input type="password" name="password" placeholder="Dejar vacío para no cambiar" minlength="6"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <p class="text-xs text-gray-400 mt-1">Mínimo 6 caracteres. Solo completa si deseas cambiar tu contraseña.</p>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            ${icon("shield", "w-4 h-4")} Rol: <span class="font-medium text-indigo-600 dark:text-indigo-400">${user?.role}</span>
          </div>
          <button type="submit" id="saveProfileBtn"
            class="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
            ${icon("save", "w-4 h-4 inline")} Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  `;
}

profileView._init = async () => {
  const user = getSession();
  const photoInput = document.querySelector("#photoInput");
  const avatarPreview = document.querySelector("#avatarPreview");
  const form = document.querySelector("#profileForm");
  const saveBtn = document.querySelector("#saveProfileBtn");

  let newPhotoUrl = "";

  const renderAvatar = (url) => {
    if (url) {
      avatarPreview.innerHTML = `<img src="${url}" alt="Avatar" class="w-full h-full object-cover">`;
    } else {
      const initials = user?.name?.charAt(0).toUpperCase() || "?";
      avatarPreview.innerHTML = initials;
    }
  };

  // Cargar foto actual desde la API
  try {
    const fullUser = await getUserById(user.id);
    newPhotoUrl = fullUser.photo || "";
  } catch {
    // ignore
  }
  renderAvatar(newPhotoUrl);

  // Subir foto y auto-guardar en db.json
  photoInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      avatarPreview.innerHTML = `${icon("loader-circle", "w-8 h-8 animate-spin")}`;

      try {
        // Usar el nombre del usuario sanitizado para el filename
        const nameSlug = (user?.name || "user").replace(/[^a-zA-Z0-9_-]/g, "_");
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, filename: `profile_${nameSlug}` }),
        });
        const data = await res.json();
        newPhotoUrl = data.url;

        // Auto-guardar la foto en db.json sin esperar que el usuario pulse "Guardar Cambios"
        const remember = !!localStorage.getItem("cinema_user");
        const updated = await updateUser(user.id, { photo: newPhotoUrl });
        saveSession(updated, remember);

        renderAvatar(newPhotoUrl);
        showToast("Foto de perfil actualizada", "success");
      } catch {
        showToast("Error al subir la foto", "error");
        renderAvatar(newPhotoUrl || "");
      }
    };
    reader.readAsDataURL(file);
  });

  // Guardar cambios del formulario (nombre, email, contraseña)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtn.innerHTML = `${icon("loader-circle", "w-4 h-4 inline animate-spin")} Guardando...`;

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      photo: newPhotoUrl,
    };

    if (form.password.value.trim()) {
      if (form.password.value.length < 6) {
        showToast("La contraseña debe tener al menos 6 caracteres", "error");
        saveBtn.disabled = false;
        saveBtn.innerHTML = `${icon("save", "w-4 h-4 inline")} Guardar Cambios`;
        return;
      }
      data.password = form.password.value;
    }

    try {
      const updated = await updateUser(user.id, data);
      const remember = !!localStorage.getItem("cinema_user");
      saveSession(updated, remember);
      showToast("Perfil actualizado correctamente", "success");
    } catch {
      showToast("Error al actualizar el perfil", "error");
    }

    saveBtn.disabled = false;
    saveBtn.innerHTML = `${icon("save", "w-4 h-4 inline")} Guardar Cambios`;
  });
};
