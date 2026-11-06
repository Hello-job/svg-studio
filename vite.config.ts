import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: {
    rollupOptions: {
      input: {
        editor: fileURLToPath(new URL("./index.html", import.meta.url)),
        install: fileURLToPath(new URL("./install.html", import.meta.url)),
      },
    },
  },
  server: { port: 4317, strictPort: true },
});
