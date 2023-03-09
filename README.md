# rollup-plugin-bundle-extendscript
An **experimental** Rollup plugin to automatically bundle `.jsx` extendscript files that are referenced on the js side of your cep plugin. 


# Installation
```js
npm install rollup-plugin-bundle-extendscript --dev
```

# Usage

With Rollup (rollup.config.js):
```js
import { bundleExtendScript } from 'rollup-plugin-bundle-extendscript';

export default {
    plugins: [
        bundleExtendScript(),
    ],
};
```

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

<br><br>

## How do it work
Write your code like this:
```js
import path from 'path';

let jsxfile = path.join(
    new CSInterface().getSystemPath(SystemPath.EXTENSION),
    new URL(import.meta.url).pathname,
    './jsx/file.jsx'
);

cs.evalScript(`$.evalFile("${jsxfile}")`); 
```

When you bundle your code with rollup, the plugin will find the relative path in your code:
```js
"./jsx/file.jsx"
```
If it finds the file, it will pack it with your bundle to `dist/extendscript/file.jsx` and 


# Warning
When using Vite, meta url bundles files by default which does not play nicely with this plugin. For example:
```js
new URL('./jsx/file.jsx' ,import.meta.url).pathname;