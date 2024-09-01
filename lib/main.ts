import { join, basename, resolve, extname, dirname, sep } from 'path';
import { readFileSync } from 'fs';
import resolveJSXContent from './resolveJSXContent.js';
import jsesc from 'jsesc';

let defaultOptions = {
    explicit: false,
};

let ids = new Set<string>();
export default function importJSXAsString(options = defaultOptions) {
    options = Object.assign({}, defaultOptions, options);

    return {
        name: 'rollup-plugin-import-extendscript',
        load(id: string) {

            console.log(id)

            let name = basename(id);
            let isJSX = name.includes('.jsx');
            let isJSXBIN = name.includes('.jsxbin');
            let isExtendScript = name.includes('?extendscript');
            let isKnownFormat = isJSX || isJSXBIN || isExtendScript;


            if (options.explicit && !isKnownFormat) return "export default '';";
            // else if (!isJSX && !isJSXBIN) return "";

            id = isExtendScript ? id.replace('?extendscript', '') : id;

            let content = readFileSync(id, 'utf8');

            // we need to transform the content to include any other files that are imported inside the jsx file. However, if it's a jsxbin file we can't do that so we just return the content as is.
            if (!isJSXBIN) {
                content = resolveJSXContent(id, content);
            }
            const escapedContent = jsesc(content, {
                wrap: true,
                quotes: 'backtick',
                json: true,
                indentLevel: 2, // Use 2 spaces for indentation
                compact: false, // Don't compact the output
                minimal: false, // Don't use the shortest possible escape sequences
                // __nonAsciiOnly: true, // Only escape non-ASCII characters
                // Preserve \t and \n characters
                // wrapAttributes: true,
            });
            const wrapped = `export default ${escapedContent};`;
            ids.add(id);
            return wrapped;
        },

        async writeBundle() {
            ids.forEach(id => {
                console.log(
                    (`✓ ${basename(id)}`),
                    (` as a string`)
                );
            });
        },


    };

}