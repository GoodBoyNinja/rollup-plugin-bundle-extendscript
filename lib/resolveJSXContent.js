import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';


const fileresolve = (filePath, content = null) => {
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
            content = fileresolve(includeAbsolutePath, content);
        }
    }

    return content;
};

export default fileresolve;
