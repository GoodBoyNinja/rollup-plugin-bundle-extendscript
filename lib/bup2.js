

// import { createFilter } from '@rollup/pluginutils';
// import { dirname, join, basename, extname, resolve, isAbsolute } from 'path';
// import { readFileSync, existsSync, writeFileSync } from 'fs';
// const FILE_EXTENSION = '.jsx';

// const takenAbsInputs = new Set();
// const takenFileNames = new Set();

// import shortUUID from 'short-uuid';

// let options = {
//     inputs: [],
//     output: 'extendscript',
// };


// const pack = (pluginOptions = {}) => {
//     options = { ...options, ...pluginOptions };

//     // make sure the given inputs are absolute paths (relative to the project);
//     options.inputs = options.inputs.map((path) => {
//         return isAbsolute(path) ? path : join(process.cwd(), path);
//     });

//     const jsFilter = createFilter(['**/*.js'], null, { resolve: false });
//     const jsxFilter = createFilter(['**/*.jsx'], null, { resolve: false });

//     return {
//         name: 'relative-path',
//         async transform(code, id) {
//             if (jsxFilter(id)) {
//                 console.log(id);
//                 return null;
//             }

//             if (!jsFilter(id)) {
//                 return null;
//             }




//             // merge user input with the paths found in the code
//             let jsxPaths = [...getJSXPathsFromModuleContent(code), ...options.inputs];
//             if (!jsxPaths.length) return;


//             // since we merge to different arrays, filter out paths that are already in the array (but perform the check agaisnt an array of absolute paths). This is to make sure we don't emit the same file twice.
//             jsxPaths = jsxPaths.filter((path) => {
//                 let absPath = isAbsolute(path) ? path : join(dirname(id), path);
//                 if (takenAbsInputs.has(absPath)) { return false; }
//                 takenAbsInputs.add(absPath);
//                 return true;
//             });


//             const dir = dirname(id);
//             let newCode = code;

//             for (let path of jsxPaths) {
//                 let fullPath = isAbsolute(path) ? path : join(dir, path);
//                 fullPath = !existsSync(fullPath) ? fullPath + FILE_EXTENSION : fullPath;
//                 if (!existsSync(fullPath)) continue;

//                 let content = readFileSync(fullPath, 'utf-8');
//                 let mergedContent = mergeJSXFileChain(fullPath, content);
//                 let mergeFailed = (content && !mergedContent) || (mergedContent.length < content.length);
//                 if (mergeFailed) { console.warn('▶︎ JSX Content merge failed :('); }
//                 else { content = mergedContent; }


//                 let emittedId = this.emitFile({
//                     type: 'asset',
//                     fileName: resolveFileName(fullPath),
//                     source: content,
//                 });


//                 newCode = newCode.replace(path, this.getFileName(emittedId));
//             }

//             return {
//                 code: newCode,
//                 map: null
//             };

//         },
//     };
// };


// function getJSXPathsFromModuleContent(content = '') {
//     let lines = content.split(/[\n\r;]+/).filter((line) => line.includes(FILE_EXTENSION));

//     // only lines that have strings in them: ', ", ` or `, 
//     lines = lines.filter((line) => { return /['"`]/.test(line); });

//     // filter out comments and imports
//     lines = lines.filter((line) => {
//         let ops = ['/*', '//', 'import', 'export', 'require'];
//         return line && !ops.some((op) => line.includes(op));
//     });

//     if (!lines.length) { return []; }

//     let paths = lines.map((line) => { return extractPath(line); });
//     paths = paths.filter((path) => path);
//     paths = paths.map((path) => path.trim());
//     return paths;

// }

// function mergeJSXFileChain(filePath, content = null) {
//     if (content === null) {
//         content = readFileSync(filePath, 'utf8');
//     }

//     const includeRegex = /\/\/@include\s+(?:'|")(.*?)(?:'|");|#include\s+(?:'|")(.*?)(?:'|");|\$\.(?:evalFile|include)\(["'](.*?)['"]\)/g;
//     const matches = content.matchAll(includeRegex);

//     for (const match of matches) {
//         const includePath = match[1] || match[2] || match[3];
//         const includeAbsolutePath = resolve(dirname(filePath), includePath);

//         if (existsSync(includeAbsolutePath)) {
//             const includeContent = readFileSync(includeAbsolutePath, 'utf8');
//             content = content.replace(match[0], includeContent);
//             content = mergeJSXFileChain(includeAbsolutePath, content);
//         }
//     }

//     return content;
// }

// function extractPath(lineOfCode) {
//     const pathRegex = /(['"`])(.*?)(\1)/g;
//     const match = pathRegex.exec(lineOfCode);
//     return match ? match[2] : null;
// }

// function resolveFileName(fullPath) {
//     let relToDist = join(options.output, basename(fullPath));
//     if (takenFileNames.has(relToDist)) {
//         relToDist = relToDist.replace(
//             extname(relToDist), `_${shortUUID.generate()}${extname(relToDist)}`
//         );
//     };

//     takenFileNames.add(relToDist);
//     return relToDist;
// }


// export default pack;