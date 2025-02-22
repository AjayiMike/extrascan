import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import nodePolyfills from "vite-plugin-node-stdlib-browser";

export default defineConfig({
    plugins: [react(), nodePolyfills()],
    build: {
        outDir: "dist",
        lib: {
            entry: resolve(__dirname, "src/content/index.tsx"),
            name: "content",
            fileName: () => "content.js",
            formats: ["iife"],
        },
        emptyOutDir: false,
        rollupOptions: {
            output: {
                extend: true,
            },
        },
    },
    define: {
        // make the env var available to the content script to prevent `Uncaught ReferenceError: process is not defined` error
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
});
