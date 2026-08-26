import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// 👇 Change this to match your GitHub repo name, e.g. "/amelies-drive-log/"
// If your repo is named "username.github.io" (a user/org site), use "/" instead.
const REPO_NAME = "/dmv-drive-log/";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // We already manage our own manifest.webmanifest link + icons in
      // index.html/public/, so this only adds the service worker layer
      // (offline app-shell caching), without touching that setup.
      manifest: false,
      includeAssets: [
        "favicon.ico",
        "favicon-32.png",
        "apple-touch-icon.png",
        "icon-192.png",
        "icon-512.png",
      ],
      workbox: {
        // Precache the built app shell (JS/CSS/HTML/icons) so the app can
        // launch and run with zero network connectivity, not just once
        // Firestore's own offline data cache kicks in.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
      },
    }),
  ],
  base: REPO_NAME,
});
