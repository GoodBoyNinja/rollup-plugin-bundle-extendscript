// my-plugin.js

import path from 'path';

export default function myPlugin() {
    let sourcePath;

    return {
        name: 'my-plugin',
        // load(id) {
        //     console.log(path.extname(id));
        //     if (id.endsWith('.jsx')) {
        //         sourcePath = path.dirname(id);
        //     }

        //     return null;
        // },
        generateBundle(options, bundle) {
            for (const fileName in bundle) {
                const asset = bundle[fileName];

                if (fileName.endsWith('.jsx')) {
                    // Apply transformation to the asset here
                    // ...

                    // Get the absolute path of the source file
                    // const absoluteSourcePath = path.resolve(sourcePath);
                    console.log(fileName, bundle[fileName]);

                    // Update the asset's contents
                    asset.source = 'HELLO';
                }
            }
        },
    };
}
