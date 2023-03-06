// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from "path-browserify";


let libName = 'rollup-plugin-copy-cep-manifest';
export default defineConfig({
    build: {
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: resolve(__dirname, 'lib/main.js'),
            name: `${libName}`,
            // the proper extensions will be added
            fileName: (format) => `${libName}.${format}.js`,
        },
        rollupOptions: {
            plugins: [
                nodePolyfills(),
            ],
            external: ['fs', 'path', 'fs-extra'],
        }
    },
    resolve: {
        alias: {
            path: "path-browserify",
        },
    }
});
