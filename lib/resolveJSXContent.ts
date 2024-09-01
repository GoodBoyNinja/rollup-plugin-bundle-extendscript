import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';

const fileresolve = (filePath: string, content = "") => {
    if (content === null) {
        content = readFileSync(filePath, 'utf8');
    }

    let includeTypes = ['//@include', '// @include', '#include'];
    let includeRegex = new RegExp(`(${includeTypes.join('|')})\\s*['"]?([^'"]*)['"]?\\s*;?`, 'g');
    let linesWithIncludes = content.match(includeRegex) || [];


    for (let line of linesWithIncludes) {
        const includePath = getValueBetweenQuotes(line);
        if (!includePath) continue;
        let includeAbsolutePath = resolve(dirname(filePath), includePath);

        if (!existsSync(includeAbsolutePath)) {
            // this could be a ts compiled file, so try to grab the js equivalent
            let ext = includePath.split('.').pop();
            includeAbsolutePath = includeAbsolutePath.replace(new RegExp(`\\.${ext}$`), '.js');
        }

        if (existsSync(includeAbsolutePath)) {
            // console.log(includeAbsolutePath);
            let includeContent = readFileSync(includeAbsolutePath, 'utf8');
            content = content.replace(line, includeContent);
            content = fileresolve(includeAbsolutePath, content); // add a semicolon to the end of the file to prevent errors
            if (content.endsWith(';') === false) {
                content += ';\n';
            }
        }

    }

    // remove lines of references to files. example:
    /// <reference path="./jsother.ts " />
    /// <reference types="./types.ts " />
    let linesWithReferences = content.match(/\/\/\/\s*<reference\s+.*\s*\/>/g) || [];
    for (let line of linesWithReferences) {
        content = content.replace(line, '');
    }

    return content;
};

function getValueBetweenQuotes(string: string) {
    // gets the string between the first set of quotes, single or double
    const regex = /['"]([^'"]*)['"]/;
    const matches = string.match(regex);
    if (matches) {
        return matches[1];
    }
    return null;

}

export default fileresolve;
