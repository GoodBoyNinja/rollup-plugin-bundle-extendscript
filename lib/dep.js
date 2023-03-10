

function extractPath(lineOfCode) {
    const pathRegex = /(['"`])(.*?)(\1)/g;
    const match = pathRegex.exec(lineOfCode);
    return match ? match[2] : null;
}

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


