import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                index: resolve(__dirname, "index.html"),
                auth: resolve(__dirname, "auth.html"),
                pricing: resolve(__dirname, "pricing.html"),
                session: resolve(__dirname, "session.html"),
                knowledgePack: resolve(__dirname, "knowledge-pack.html"),
                timeSelection: resolve(__dirname, "time-selection.html"),
            },
        },
    },
});