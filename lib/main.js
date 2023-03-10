
import path, { join, basename, resolve, extname, dirname } from 'path';
import { readFileSync, } from 'fs';
import resolveJSXContent from './resolveJSXContent.js';
import recursive from 'recursive-readdir';
import { createFilter } from 'rollup-pluginutils';
const FILE_EXTENSION = '.jsx';
let suspectsRelativeToProject = new Set();
const referencedChunks = new Set();
import jsesc from 'jsesc';

export default function importJSXAsString(options = {
    include: '**/*.jsx',
}) {
    const filter = createFilter(options.include, options.exclude);

    return {
        name: 'import-jsx-as-string',
        load(id) {
            if (filter(id) && /\.jsx?$/.test(id)) {
                const content = readFileSync(id, 'utf8');

                const transformedContent = resolveJSXContent(id, content);
                let escapedContent = jsesc(transformedContent, {
                    wrap: true,
                    quotes: 'single',
                    json: true,
                    indentLevel: 2, // Use 2 spaces for indentation
                    compact: false, // Don't compact the output
                    minimal: false, // Don't use the shortest possible escape sequences
                    __nonAsciiOnly: true, // Only escape non-ASCII characters
                    // Preserve \t and \n characters
                    unicode: false,
                    wrapAttributes: true,
                });

                // because this is extendscript and not javascript, we need to escape the backticks
                escapedContent = escapedContent.replace(/`/g, '\\`');

                return `export default ${JSON.stringify(escapedContent)}`;
            }
        }

        // transform(code, id) {

        //     let gate = filter(id) && /\.jsx?$/.test(id);
        //     if (id.endsWith('.jsx')) {
        //         console.log('@@@@@@');
        //         const contents = JSON.stringify(code);
        //         const replacement = `export default ${contents};`;
        //         console.log(replacement);

        //         return {
        //             code: replacement,
        //             map: { mappings: '' },
        //         };
        //     }

        // },
    };
};