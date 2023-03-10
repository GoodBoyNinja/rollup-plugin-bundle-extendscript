import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';

const fileresolve = (filePath, content = null) => {
    if (content === null) {
        content = readFileSync(filePath, 'utf8');
    }

    const includeRegex = /\/\/@include\s+(?:'|")(.*?)(?:'|;(?=\s)|");|#include\s+(?:'|")(.*?)(?:'|;(?=\s)|");|\$\.(?:evalFile|include)\(["'](.*?)(?:';(?=\s)|")\)/g;

    const matches = content.matchAll(includeRegex);
    for (const match of matches) {
        const includePath = match[1] || match[2] || match[4];
        const includeAbsolutePath = resolve(dirname(filePath), includePath);
        if (existsSync(includeAbsolutePath)) {
            let includeContent = readFileSync(includeAbsolutePath, 'utf8');
            content = content.replace(match[0], `${includeContent}`);
            content = fileresolve(includeAbsolutePath, content + ';\n'); // add a semicolon to the end of the file to prevent errors
        }
    }
    return content;
};

export default fileresolve;
