import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';

const fileresolve = (filePath, content = null) => {
    if (content === null) {
        content = readFileSync(filePath, 'utf8');
    }

    /*
        In extendscript, there are two ways to include other files:
        // @include "path/to/file.jsx" (including the comment dashes)
        #include "path/to/file.jsx"

        Sometimes, those lines can end with a semicolon, sometimes not.
        Sometimes the path is wrapped in single quotes, sometimes in double quotes.
        Sometimes there's a space between the comment and the @include, sometimes not.
        The regex needs to match all of these cases.

    */
    let includeTypes = ['//@include', '// @include', '#include'];
    let includeRegex = new RegExp(`(${includeTypes.join('|')})\\s*['"]?([^'"]*)['"]?\\s*;?`, 'g');

    //  find all lines with includes (they could end with a newline, or a semicolon)
    let linesWithIncludes = content.match(includeRegex) || [];


    for (let line of linesWithIncludes) {
        // extract the path after the include statement (could be wrapped in single or double quotes)
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

function getValueBetweenQuotes(string) {
    // gets the string between the first set of quotes, single or double
    const regex = /['"]([^'"]*)['"]/;
    const matches = string.match(regex);
    if (matches) {
        return matches[1];
    }
    return null;

}

export default fileresolve;
