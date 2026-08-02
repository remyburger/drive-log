import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 👇 Change this to match your GitHub repo name, e.g. "/amelies-drive-log/"
// If your repo is named "username.github.io" (a user/org site), use "/" instead.
const REPO_NAME = "/drive-log/";

export default defineConfig({
  plugins: [react()],
  base: REPO_NAME,
});
