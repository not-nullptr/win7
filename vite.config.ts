import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	base: process.env.VITE_BASE_URL || "/",
});
