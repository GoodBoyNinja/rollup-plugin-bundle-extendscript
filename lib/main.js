import { join, basename, resolve, extname, dirname, sep } from 'path';
import { readFileSync } from 'fs';
import resolveJSXContent from './resolveJSXContent.js';
import jsesc from 'jsesc';
import colors from 'colors/safe';

let defaultOptions = {
    explicit: false,
};

let ids = new Set();
export default function importJSXAsString(options = defaultOptions) {
    options = Object.assign({}, defaultOptions, options);

    return {
        name: 'rollup-plugin-import-extendscript',
        load(id) {
            let name = basename(id);
            let isJSX = name.includes('.jsx');
            let isJSXBIN = name.includes('.jsxbin');
            let isExtendScript = name.includes('?extendscript');

            if (options.explicit && !isExtendScript) return null;
            else if (!isJSX && !isJSXBIN) return null;

            id = isExtendScript ? id.replace('?extendscript', '') : id;

            let content = readFileSync(id, 'utf8');

            // we need to transform the content to include any other files that are imported inside the jsx file. However, if it's a jsxbin file we can't do that so we just return the content as is.
            if (!isJSXBIN) {
                content = resolveJSXContent(id, content);
            }
            const escapedContent = jsesc(content, {
                wrap: true,
                quotes: 'single',
                json: true,
                indentLevel: 2, // Use 2 spaces for indentation
                compact: false, // Don't compact the output
                minimal: false, // Don't use the shortest possible escape sequences
                __nonAsciiOnly: true, // Only escape non-ASCII characters
                // Preserve \t and \n characters
                wrapAttributes: true,
            });
            const stringified = JSON.stringify(escapedContent);
            // const evalified = `eval(${stringified})`;
            // remove first and last letters of stringified
            const evalified = stringified.substring(1, stringified.length - 1);
            const wrapped = `export default \`${evalified}\`;`;
            ids.add(id);
            return wrapped;
        },

        async writeBundle() {
            ids.forEach(id => {
                console.log(
                    colors.green(`✓ ${basename(id)}`),
                    colors.grey(` as a string`)
                );
            });
        },


    };

};