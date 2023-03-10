# rollup-plugin-bundle-extendscript
An **experimental** Rollup plugin to automatically bundle `.jsx` extendscript files that are referenced on the js side of your cep plugin. 


# Installation
```js
npm install rollup-plugin-bundle-extendscript --dev
```

# Usage



With Vite (vite.config.js):
```js
import { defineConfig } from 'vite';
import  bundleExtendScript  from 'rollup-plugin-bundle-extendscript';

export default defineConfig({
    build: {
        rollupOptions: {
            plugins: [
                bundleExtendScript(),
            ],
        },
    }
});
```

In your cep plugin, write your absolute path to the `.jsx` file in the following fashion:
```js
    let cs = new CSInterface();
    
    let filepath = new URL('./jsx/file.jsx' ,import.meta.url).pathname;
    cs.evalScript(`$.evalFile("${filepath}")`);
```

Vite automatically bundles the jsx file. Then, the plugin will process the jsx file to resolve any `#include`, `$.evalFile()`s or `@@include` in the jsx file.

