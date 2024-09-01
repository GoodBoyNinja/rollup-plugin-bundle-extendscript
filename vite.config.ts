// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from "path-browserify";
import importExtendscript from "./lib/main";
import dts from 'vite-plugin-dts';



let libName = 'rollup-plugin-import-extendscript';
export default defineConfig(({ command }) => {
    return {
        build: {
            lib: {
                // Could also be a dictionary or array of multiple entry points
                entry: resolve(__dirname, 'lib/main.ts'),
                name: `${libName}`,
                // the proper extensions will be added
                fileName: (format) => `${libName}.${format}.js`,
            },
            minify: false,
            rollupOptions: {

                external: ['fs', 'path', 'fs-extra', 'crypto'],
                plugins: [
                    nodePolyfills(),
                ]
            },

        },
        plugins: [
            dts({ rollupTypes: true }),
            command === 'serve' && importExtendscript({ explicit: false }),
        ],

        resolve: {
            alias: {
                path: "path-browserify",
            },
        }
    }
});