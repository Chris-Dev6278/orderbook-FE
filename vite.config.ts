import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            include: ["buffer", "process", "util", "stream"],
            globals: {
                Buffer: true,
                process: true,
                global: true
            }
        })
    ],
    server: {
        host: "0.0.0.0",
        port: 5173
    },
    optimizeDeps: {
        exclude: ["@hashgraph/sdk", "@hashgraph/hedera-wallet-connect"]
    },
    build: {
        outDir: "dist",
        sourcemap: false,
        commonjsOptions: {
            transformMixedEsModules: true
        }
    }
});
