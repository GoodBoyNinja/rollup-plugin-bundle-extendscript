import path from 'path';
import * as fs from 'fs';

export default function myPlugin() {
    return {
        name: 'my-plugin',
        transform(code, id) {
            // Find all "./path/to/file.jsx" strings in the code

            if (!id.endsWith('.js')) {
                return null;
            }

            const jsxPaths = code.match(/"(\.\/.+?\.jsx)"/g);
            if (!jsxPaths) {
                return null;
            }


            // Emit each JSX file and replace the path in the code
            jsxPaths.forEach((jsxPath) => {
                const abs = path.resolve(path.dirname(id), jsxPath.slice(1, -1));
                if (!fs.existsSync(abs)) {
                    return;
                }


                let fileName = path.basename(abs).replace(/\.jsx$/, '.jsx');
                const emittedId = this.emitFile({
                    type: 'asset',
                    fileName: fileName,
                    id: jsxPath.slice(1, -1), // Remove the surrounding quotes
                });

                console.log(fileName, path.dirname(id), emittedId);
                const relativeJsPath = path.relative(path.dirname(id), fileName);
                return;
                code = code.replace(
                    jsxPath,
                    `"./${relativeJsPath.replace(/\\/g, '/').replace(/\.jsx$/, '')}"`
                );
            });

            return { code };
        },
    };
};