

import { createFilter } from '@rollup/pluginutils';
import path, { dirname, join, basename, extname, resolve, isAbsolute, relative } from 'path';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import recursive from 'recursive-readdir';
import { Console } from 'console';


const FILE_EXTENSION = '.jsx';
const takenAbsInputs = new Set();
const takenFileNames = new Set();
const placeholders = new Map();

let suspects = new Set();
let filesAwaitingEdit = new Set();
let editsPending = new Map();



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

        transform(code, id) {
            let paths = getJSXPathsFromModuleContent(code);
            if (!paths.length) { return; }

            for (let path of paths) {
                let abs = isAbsolute(path) ? path : resolve(dirname(id), path);
                let fromProject = relative(process.cwd(), abs);
                if (!suspects.has(fromProject)) { continue; }

                let bundlePath = join('extendscript', basename(abs));


                let emitId = this.emitFile({
                    type: 'asset',
                    id: abs,
                    fileName: bundlePath,
                    name: basename(abs),
                    source: mergeJSXFileChain(abs),
                });

                editsPending.set(path, bundlePath);


            }


        },

        async generateBundle(options, bundle) {
            // let outputJSFile = join(options.dir, );

            let entry = Object.values(bundle).find((chunk) => chunk.isEntry);
            if (!entry) { return; }

            let newCode = entry.code;
            for (let [from, to] of editsPending) {
                // to needs to be relative to the output file
                let relToOutput = relative(dirname(entry.fileName), to);
                newCode = newCode.replaceAll(from, relToOutput);
            }

            entry.code = newCode;

        },





    };


};




function getJSXPathsFromModuleContent(content = '') {
    let lines = content.split(/[\n\r;]+/).filter((line) => line.includes(FILE_EXTENSION));

    // only lines that have strings in them: ', ", ` or `, 
    lines = lines.filter((line) => { return /['"`]/.test(line); });

    // filter out comments and imports
    lines = lines.filter((line) => {
        let ops = ['/*', '//', 'import', 'export', 'require'];
        return line && !ops.some((op) => line.includes(op));
    });

    if (!lines.length) { return []; }

    let paths = lines.map((line) => { return extractPath(line); });
    paths = paths.filter((path) => path);
    paths = paths.map((path) => path.trim());
    return paths;

}

function mergeJSXFileChain(filePath, content = null) {
    if (content === null) {
        content = readFileSync(filePath, 'utf8');
    }

    const includeRegex = /\/\/@include\s+(?:'|")(.*?)(?:'|");|#include\s+(?:'|")(.*?)(?:'|");|\$\.(?:evalFile|include)\(["'](.*?)['"]\)/g;
    const matches = content.matchAll(includeRegex);

    for (const match of matches) {
        const includePath = match[1] || match[2] || match[3];
        const includeAbsolutePath = resolve(dirname(filePath), includePath);

        if (existsSync(includeAbsolutePath)) {
            const includeContent = readFileSync(includeAbsolutePath, 'utf8');
            content = content.replace(match[0], includeContent);
            content = mergeJSXFileChain(includeAbsolutePath, content);
        }
    }

    return content;
}

function extractPath(lineOfCode) {
    const pathRegex = /(['"`])(.*?)(\1)/g;
    const match = pathRegex.exec(lineOfCode);
    return match ? match[2] : null;
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


