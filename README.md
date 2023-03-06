# rollup-plugin-bundle-cep-manifest
### A Rollup plugin to bundle the CSXS folder, including the manifest.xml file, to the dist folder.

It also updates the paths in the `manifest.xml` file to match the new location of the files in the `dist` folder. For example:
    



*Tip: Better used with Vite :)*

# Installation
```js
npm install rollup-plugin-bundle-cep-manifest
```

# Usage

With Rollup (rollup.config.js):
```js
import { bundleManifest } from 'rollup-plugin-bundle-cep-manifest';

export default {
    plugins: [
        bundleManifest(),
    ],
};
```

With Vite (vite.config.js):
```js
import { defineConfig } from 'vite';
import { bundleManifest } from 'rollup-plugin-bundle-cep-manifest';

export default defineConfig({
    build: {
        rollupOptions: {
            plugins: [
                bundleManifest(),
            ],
        },
    }
});
```

<br><br>

## Automatic
The plugin updates the paths in the `manifest.xml` file to match the new location of the files in the `dist` folder. For example:


```xml
<MainPath> ./index-dev.html </MainPath>
```
becomes

```xml
<MainPath> ./index.html </MainPath>
```

When used with `Vite` the plugin does a better job at updating the paths, since it knows the final location of the files (Vite bundles html files by default).

When used with Rollup, the plugin will try its best and guess the final location of the files, but it might fail. In that case, you can manually remap the paths (see below).


## Manual

To manually convert the paths in your `manifest.xml` file, you can use the `remap` option:

```js
bundleManifest({
    {
    remap: {
        "./index-dev.html": "./index.html",
    }
}),
```

Note that the final paths (those on the right) should be relative to the `dist` folder.

You can specify more than one path to remap:
```js
bundleManifest({
    {
    remap: {
        "./index-dev.html": "./index.html",
        "./other-index-dev": "./other-index.js",
    }
}),
```


Enjoy :)