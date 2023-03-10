/**
 * Options for the importJSXAsString plugin.
 */
interface ImportJSXOptions {
    /**
     * When `true`, only files imported with a suffix of "?extendscript" will be imported. For example: ` import myFile from './myFile.jsx?extendscript' `
     */
    explicit?: boolean;
}

/**
 * A Rollup plugin that imports `.jsx` files as strings.
 */
declare function importJSXAsString(options?: ImportJSXOptions): RollupPlugin;

export default importJSXAsString;
