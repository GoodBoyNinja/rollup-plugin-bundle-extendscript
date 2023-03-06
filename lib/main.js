
import path from "path";
import { copy } from "fs-extra";
import * as fs from "fs";
import recursive from "recursive-readdir";
import colors from 'colors/safe';

let defaultPluginOptions = {
    remap: {
    }
};

export const bundleManifest = (pluginOptions = {}) => {
    pluginOptions = { ...defaultPluginOptions, ...pluginOptions };

    return {
        name: "rollup-plugin-bundle-cep-manifest",
        writeBundle: async (options, bundle) => {

            const bundleDir = options.dir ? options.dir : options.file ? path.dirname(options.file) : process.cwd() + "/dist";


            // copy the CSXS folder and its manifest to the dist folder
            let og = {
                csxs: path.resolve(process.cwd(), "CSXS"),
                manifest: path.resolve(process.cwd(), "CSXS", "manifest.xml"),
            };

            let dest = {
                csxs: path.resolve(bundleDir, "CSXS"),
                manifest: path.resolve(bundleDir, "CSXS", "manifest.xml"),
            };
            await copy(og.csxs, dest.csxs);
            await copy(og.manifest, dest.manifest);

            if (!fs.existsSync(dest.manifest)) {
                throw new Error("Manifest did not copy successfully. Make sure it exists in the root of your project, like so:", og.manifest);
            }





            // read the manifest file and get the main paths
            let manifestContent = fs.readFileSync(dest.manifest, "utf-8");
            let mainPathsTags = manifestContent.match(/<MainPath>.*<\/MainPath>/g);
            let mainPaths = mainPathsTags.map((tag) => tag.replace(/<MainPath>|<\/MainPath>/g, ""));



            /* from rollup, get each html chunk as an object of {path, bundlePath}
                path: the path of the html file relative to the *extension root*
                bundlePath: the path of the html file relative to the *bundle*
            */
            const htmlFiles = Object.values(bundle).filter((file) => file.type === "asset" && /\.html$/.test(file.fileName));
            const htmlChunks = await Promise.all(
                htmlFiles.map(async (file) => {
                    const filePath = path.join(bundleDir, file.fileName);
                    // const contents = await fs.promises.readFile(filePath, "utf-8");
                    return {
                        path: file.fileName,
                        bundlePath: filePath,
                        // contents,
                    };
                })
            );


            // if no html chunks found, try to automatically find html files both in the bundle, and in the extension root
            if (htmlChunks.length === 0) {
                let htmlInProject = await recursive(process.cwd());
                htmlInProject = htmlInProject.filter((html) => /\.html$/.test(html));
                htmlInProject = htmlInProject.filter((html) => !html.includes("node_modules"));
                htmlInProject.sort((a, b) => a.split("/").length - b.split("/").length); // sort by deepness

                let nonBundled = htmlInProject.filter((html) => !html.includes(bundleDir));
                let bundled = htmlInProject.filter((html) => html.includes(bundleDir));
                // if there's only one we're just gonna guess that it's the right one
                if (nonBundled.length === 1 && bundled.length === 1) {
                    htmlChunks.push({
                        path: nonBundled[0],
                        bundlePath: bundled[0],
                    });
                }

                // since we sorted them by deepness, we can try to match them by name. 
                for (let i = 0; i < bundled.length; i++) {
                    let name = path.basename(bundled[i]);
                    let nonBundledMatch = nonBundled.find((html) => path.basename(html) === name);
                    if (nonBundledMatch) {
                        htmlChunks.push({
                            path: nonBundledMatch,
                            bundlePath: bundled[i],
                        });

                        // remove the matched ones from the arrays
                        nonBundled = nonBundled.filter((html) => html !== nonBundledMatch);
                    }
                }

                // warn the user that result may be wrong
                if (htmlChunks.length) {

                    let info = "";
                    for (let chunk of htmlChunks) {
                        let c = { ...chunk };
                        info += `   ${c.path.replace(process.cwd(), ' ')} => ${c.bundlePath.replace(process.cwd(), ' ')}`;
                    }

                    console.log(`\n\n${colors.magenta(`\ CSXS/manifest.xml:\nI am guessing your html bundle transformation. My guesses are: \n${colors.underline(info)}\n\n If these are wrong, please manually specify a remap object while calling the plugin, or simply use Vite :) \n\n`)}`);
                }
            }










            /*
                If user gives a remap object, use it.
                If there is only one html file and one main path, use it.
                If we found an exact match between the html file and the main path, use it.
                If we found a loose match between the html file and the main path, use it.
                If we found no matches, throw an error.
            */
            let pathsMap =
                mapByRemapObject(mainPaths, pluginOptions.remap) ||
                mapByFirst(htmlChunks, mainPaths) ||
                mapByResolvedExact(htmlChunks, mainPaths) ||
                mapByResolvedLoose(htmlChunks, mainPaths) ||
                new Map();

            if (pathsMap.size === 0) {
                throw new Error("No matches found between html files and main paths. Make sure your configuration packs your html files, or manually add them to the bundle.");
            }

            pathsMap = relativizeMap(pathsMap, bundleDir); // Manifest likes them relative
            let newContent = replaceInManifestContentUsingMap(manifestContent, pathsMap);


            if (!newContent) {
                throw new Error('\nSomething went wrong when replacing the main paths in the manifest. Make sure your manifest is valid XML, and that the content of each of the <MainPath> tags is valid path.');
            }


            fs.writeFileSync(dest.manifest, newContent, "utf-8");

            let csxsChildren = await recursive(dest.csxs);
            console.log(colors.green(`\n✓ ${dest.csxs.replace(process.cwd(), '')} and ${csxsChildren.length} children`));
            return;
        },
    };
};




function mapByFirst(htmlChunks = [], mainPaths = []) {
    let pathsMap = new Map();
    if (htmlChunks.length === 1 && mainPaths.length === 1) {
        pathsMap.set(mainPaths[0], htmlChunks[0].bundlePath);
        return pathsMap;
    }
    if (pathsMap.size > 0) {
        return pathsMap;
    }

}

function mapByResolvedExact(htmlChunks = [], mainPaths = []) {
    let pathsMap = new Map();
    for (let htmlChunk of htmlChunks) {
        for (let mainPath of mainPaths) {
            if (path.resolve(htmlChunk.path) === path.resolve(mainPath)) {
                pathsMap.set(mainPath, htmlChunk.bundlePath);
            }
        }
    }

    if (pathsMap.size > 0) {
        return pathsMap;
    }

}

function mapByResolvedLoose(htmlChunks = [], mainPaths = []) {
    // like mapByResolvedExact, but use indexof instead of strict equality
    let pathsMap = new Map();
    for (let htmlChunk of htmlChunks) {
        for (let mainPath of mainPaths) {
            let mainPathName = path.basename(mainPath).replace('.html', '');
            let htmlPathName = path.basename(htmlChunk.path).replace('.html', '');
            if (mainPathName.indexOf(htmlPathName) !== -1) {
                pathsMap.set(mainPath, htmlChunk.bundlePath);
            }
        }
    }

    if (pathsMap.size > 0) {
        return pathsMap;
    }

}

function mapByRemapObject(mainPaths = [], remap = {}) {
    let pathsMap = new Map();
    for (let mainPath of mainPaths) {
        let newMainPath = remap[mainPath];
        if (newMainPath) {
            pathsMap.set(mainPath, newMainPath);
        }
    }

    if (pathsMap.size > 0) {
        return pathsMap;
    }
}



function replaceInManifestContentUsingMap(content = "", map = new Map()) {
    for (let [key, value] of map) {
        content = content.replace(key, value);
    }
    return content;
}

function relativizeMap(map = new Map(), base = "") {
    for (let [key, value] of map) {
        let newVal = path.relative(base, value);
        // the manifest.xml likes when it starts with ./ if it's a relative path
        if (newVal[0] !== ".") {
            newVal = "./" + newVal;
        }
        map.set(key, newVal);
    }

    return map;
};
