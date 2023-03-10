
import path, { join, basename,  } from 'path';
import { readFileSync, } from 'fs';
import resolveJSXContent from './resolveJSXContent.js';

import recursive from 'recursive-readdir';
const FILE_EXTENSION = '.jsx';
let suspectsRelativeToProject = new Set();


export default function () {
    return {
        name: 'my-plugin',
        async buildStart() {
            let files = await recursive(process.cwd(), ['node_modules']) || [];
            files = files.filter((file) => file.endsWith(FILE_EXTENSION));
            files = files.map((file) => {
                return path.relative(process.cwd(), file);
            });
            suspectsRelativeToProject = new Set(files);
        },

        generateBundle(outputOptions, bundle) {
            let jsxInDist = Object.keys(bundle).filter((key) => key.
                endsWith(FILE_EXTENSION));
            if (!jsxInDist.length) { return; }

            for (let filename of jsxInDist) {
                let chunk = bundle[filename];
                let name = chunk.name;

                let matches = [...suspectsRelativeToProject].filter((suspect) => {
                    return basename(suspect) === name;
                }).filter((suspect) => {
                    let abs = join(process.cwd(), suspect);
                    return readFileSync(abs, 'utf8') === chunk.source;
                });
                if (!matches.length) { continue; }


                let match = matches[0];
                let absMatch = join(process.cwd(), match);

                chunk.source = resolveJSXContent(absMatch);
                suspectsRelativeToProject.delete(match);

            }
        },
    };
};