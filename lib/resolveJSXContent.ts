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
        const includeAbsolutePath = resolve(dirname(filePath), includePath);
        if (existsSync(includeAbsolutePath)) {
            // console.log(includeAbsolutePath);
            let includeContent = readFileSync(includeAbsolutePath, 'utf8');
            content = content.replace(line, includeContent);
            content = fileresolve(includeAbsolutePath, content + ';\n'); // add a semicolon to the end of the file to prevent errors
        }

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
