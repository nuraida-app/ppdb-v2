import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL;

  console.log("Current mode:", mode);
  console.log("Using API URL:", apiUrl);

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": apiUrl,
        "/assets": apiUrl,
      },
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
  };
});
