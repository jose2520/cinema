import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@views": fileURLToPath(new URL("./src/views", import.meta.url)),
      "@components": fileURLToPath(
        new URL("./src/components", import.meta.url),
      ),
      "@controllers": fileURLToPath(
        new URL("./src/controllers", import.meta.url),
      ),
      "@router": fileURLToPath(new URL("./src/router", import.meta.url)),
      "@services": fileURLToPath(new URL("./src/services", import.meta.url)),
      "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
      "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      "@api": fileURLToPath(new URL("./src/api", import.meta.url)),
    },
  },
});
