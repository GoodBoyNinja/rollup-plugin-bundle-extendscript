
import path, { dirname, join, basename, extname, resolve, isAbsolute, relative } from 'path';
import { readFileSync, existsSync, writeFileSync, statSync, read } from 'fs';
import recursive from 'recursive-readdir';

import resolveJSXContent from './resolveJSXContent.js';
const FILE_EXTENSION = '.jsx';
const takenFileNames = new Set();
let suspects = new Set();

let options = {
    inputs: [],
    output: 'extendscript',
};

export default function () {
    return {
        name: 'my-plugin',
        async buildStart() {
            let files = await recursive(process.cwd(), ['node_modules']) || [];
            files = files.filter((file) => file.endsWith(FILE_EXTENSION));
            files = files.map((file) => {
                return path.relative(process.cwd(), file);
            });
            suspects = new Set(files);
        },



        generateBundle(oOptions, bundle) {
            let jsxInDist = Object.keys(bundle).filter((key) => key.
                endsWith(FILE_EXTENSION));
            if (!jsxInDist.length) { return; }

            for (let filename of jsxInDist) {
                let chunk = bundle[filename];
                let name = chunk.name;

                let immediateSuspects = [...suspects];
                let matches = immediateSuspects.filter((suspect) => {
                    return basename(suspect) === name;
                }).filter((suspect) => {
                    let abs = join(process.cwd(), suspect);
                    return readFileSync(abs, 'utf8') === chunk.source;
                });
                if (!matches.length) { continue; }

                let match = matches[0];
                let absMatch = join(process.cwd(), match);

                chunk.source = resolveJSXContent(absMatch);

            }
        },

    };


};







function getJSXPathsFromModuleContent(content = '') {
    let lines = content.split(/[\n\r;]+/).filter((line) => line.includes(FILE_EXTENSION));


    // only lines that have strings in them: ', ", ` or `, 
    lines = lines.filter((line) => { return /['"`]/.test(line); });

    if (!lines.length) { return []; }
    let paths = lines.map((line) => { return extractPath(line); });
    paths = paths.filter((path) => path);
    paths = paths.map((path) => path.trim());

    return paths;

}



function extractPath(lineOfCode) {
    const pathRegex = /(['"`])(.*?)(\1)/g;
    const match = pathRegex.exec(lineOfCode);
    return match ? match[2] : null;
}

function extractFilePathStrings(code) {

    let paths = [];
    let regex = /(['"`])(.*?)(\1)/g;
    let match = regex.exec(code);
    while (match) {
        paths.push(match[2]);
        match = regex.exec(code);
    }
    return paths;
}

function resolveFileName(fullPath) {
    let relToDist = join(options.output, basename(fullPath));
    if (takenFileNames.has(relToDist)) {
        relToDist = relToDist.replace(
            extname(relToDist), `_${uuid()}${extname(relToDist)}`
        );
    };

    takenFileNames.add(relToDist);
    return relToDist;
}


