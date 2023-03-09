declare module 'rollup-plugin-bundle-extendscript' {

    interface Options {
        output: string;
        inputs: string[];
    }

    const pack: (pluginOptions?: Partial<Options>) => {
        name: string;
        transform: (code: string, id: string) => Promise<{
            code: string | null | undefined;
            map: any;
        } | null | undefined>;
    };

    export default pack;
}