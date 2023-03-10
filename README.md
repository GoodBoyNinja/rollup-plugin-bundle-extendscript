# rollup-plugin-import-extendscript
An experimental ___Vite / Rollup___ plugin to import ExtendScript files as a string


# Installation
```
npm install rollup-plugin-import-extendscript --dev
```

# Setup
When used with Vite, call the plugin in Vite's config instead of rollup's config to enjoy it during both development & bundling
```js
import { defineConfig } from 'vite';
import  importExtendScript  from 'rollup-plugin-import-extendscript';

export default defineConfig({
    plugins: [
        importExtendScript()
    ]
});
```


Rollup 
```js
import importExtendScript from 'rollup-plugin-import-extendscript';

export default {
  plugins: [
    importExtendScript()
  ]
};

```

# Usage
In your code, import the file as a string, then evaluate it
```js
import jsxContent from './jsx/file.jsx';
new CSInterface().evalScript(jsxContent);
```
The plugin will make sure that the file is loaded as a string, and that the string is properly escaped for ExtendScript.

# Options
## explicit
`.jsx` is not an extendscript exclusive file extension. To avoid clashes, you can set `explicit` to `true` and add a `?extendscript` suffix to your import statements. For example:

In your config file:
```js
importExtendScript({
    explicit: true
})
```

In your code:
```js
import jsxContent from './jsx/file.jsx?extendscript';
```
Files without the `?extendscript` suffix will be ignored by the plugin.


# Include
Your `.jsx` files may reference other `.jsx` files using:
```js
// file.jsx
#include './other.jsx'
```
The plugin automatically resolves these references, and includes them in the final string.

<br><br> 

🎉<br>
Good Boy Ninja




