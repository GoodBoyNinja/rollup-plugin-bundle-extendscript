declare function importJSXAsString(options?: {
    explicit: boolean;
}): {
    name: string;
    load(id: string): string;
    writeBundle(): Promise<void>;
};
export default importJSXAsString;

export { }
