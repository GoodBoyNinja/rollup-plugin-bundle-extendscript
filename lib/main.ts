import { basename, join } from "path";
import { existsSync, mkdirSync, readFileSync } from "fs";
import os from "os";
import resolveJSXContent from "./resolveJSXContent.js";
import jsesc from "jsesc";
import child_process from "child_process";


let defaultOptions = {
    explicit: false,
};

let ids = new Set<string>();
let tempDir = os.tmpdir();
let tempFolder = join(tempDir, "extendscript-vite-plugin");

export default function importJSXAsString(options = defaultOptions) {
    options = Object.assign({}, defaultOptions, options);










    return {
        name: "rollup-plugin-import-extendscript",
        load(id: string) {
            let name = basename(id);
            let isDestined = name.includes("?extendscript");

            if (!isDestined) {
                return undefined;
            }

            id = isDestined ? id.replace("?extendscript", "") : id;
            let content = "";

            try {
                content = readFileSync(id, "utf8");
            } catch (e) {
                console.error(`ExtendScript vite plugin: Error reading file ${id}`);
                return "export default ''";
            }

            let isJSX = name.includes(".jsx");
            let isJSXBIN = name.includes(".jsxbin");
            let isKnownFormat = isJSX || isJSXBIN;

            if (options.explicit && !isKnownFormat) {
                throw new Error(`The file ${name} is not a known format. Please use a .jsx or .jsxbin file, or set the explicit option to false in vite.config.js`);
            }

            if (isJSXBIN) {
                throw new Error(`The file ${name} is a jsxbin file. This plugin can't process jsxbin files.`);
            }



            // ____________________________




            // we need to transform the content to include any other files that are imported inside the jsx file. However, if it's a jsxbin file we can't do that so we just return the content as is.

            content = resolveJSXContent(id, content);

            const escapedContent = jsesc(content, {
                wrap: true,
                quotes: "backtick",
                json: true,
                indentLevel: 2, // Use 2 spaces for indentation
                compact: false, // Don't compact the output
                minimal: false, // Don't use the shortest possible escape sequences
                __nonAsciiOnly: true, // Only escape non-ASCII characters
                // Preserve \t and \n characters
                wrapAttributes: true,
            });

            const wrapped = `export default ${escapedContent};`;
            ids.add(id);


            return wrapped;
        },

        async writeBundle() {
            ids.forEach((id) => {
                console.log(`✓ ${basename(id)}`, ` as a string`);
            });
        },
    };
}
