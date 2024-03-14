import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import postcss from "rollup-plugin-postcss";
import nodePolyfills from 'vite-plugin-node-stdlib-browser'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),nodePolyfills()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    proxy: {
      "/api/plm": {
        target: "http://124.71.151.153:8058/plm",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/plm/, ""),
      },
    },
  },
  resolve: {
    alias: {
      mqtt: "mqtt/dist/mqtt.js",
    },
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
