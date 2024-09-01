import { resolve, dirname, basename } from "path";
import { readFileSync, existsSync } from "fs";
const fileresolve = (filePath, content = "") => {
  if (content === null) {
    content = readFileSync(filePath, "utf8");
  }
  let includeTypes = ["//@include", "// @include", "#include"];
  let includeRegex = new RegExp(`(${includeTypes.join("|")})\\s*['"]?([^'"]*)['"]?\\s*;?`, "g");
  let linesWithIncludes = content.match(includeRegex) || [];
  for (let line of linesWithIncludes) {
    const includePath = getValueBetweenQuotes(line);
    if (!includePath) continue;
    let includeAbsolutePath = resolve(dirname(filePath), includePath);
    if (!existsSync(includeAbsolutePath)) {
      let ext = includePath.split(".").pop();
      includeAbsolutePath = includeAbsolutePath.replace(new RegExp(`\\.${ext}$`), ".js");
    }
    if (existsSync(includeAbsolutePath)) {
      let includeContent = readFileSync(includeAbsolutePath, "utf8");
      content = content.replace(line, includeContent);
      content = fileresolve(includeAbsolutePath, content);
      if (content.endsWith(";") === false) {
        content += ";\n";
      }
    }
  }
  let linesWithReferences = content.match(/\/\/\/\s*<reference\s+.*\s*\/>/g) || [];
  for (let line of linesWithReferences) {
    content = content.replace(line, "");
  }
  return content;
};
function getValueBetweenQuotes(string) {
  const regex = /['"]([^'"]*)['"]/;
  const matches = string.match(regex);
  if (matches) {
    return matches[1];
  }
  return null;
}
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
const object = {};
const hasOwnProperty = object.hasOwnProperty;
const forOwn = (object2, callback) => {
  for (const key in object2) {
    if (hasOwnProperty.call(object2, key)) {
      callback(key, object2[key]);
    }
  }
};
const extend = (destination, source) => {
  if (!source) {
    return destination;
  }
  forOwn(source, (key, value) => {
    destination[key] = value;
  });
  return destination;
};
const forEach = (array, callback) => {
  const length = array.length;
  let index = -1;
  while (++index < length) {
    callback(array[index]);
  }
};
const fourHexEscape = (hex) => {
  return "\\u" + ("0000" + hex).slice(-4);
};
const hexadecimal = (code, lowercase) => {
  let hexadecimal2 = code.toString(16);
  if (lowercase) return hexadecimal2;
  return hexadecimal2.toUpperCase();
};
const toString = object.toString;
const isArray = Array.isArray;
const isBuffer = (value) => {
  return typeof Buffer === "function" && Buffer.isBuffer(value);
};
const isObject = (value) => {
  return toString.call(value) == "[object Object]";
};
const isString = (value) => {
  return typeof value == "string" || toString.call(value) == "[object String]";
};
const isNumber = (value) => {
  return typeof value == "number" || toString.call(value) == "[object Number]";
};
const isFunction = (value) => {
  return typeof value == "function";
};
const isMap = (value) => {
  return toString.call(value) == "[object Map]";
};
const isSet = (value) => {
  return toString.call(value) == "[object Set]";
};
const singleEscapes = {
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t"
  // `\v` is omitted intentionally, because in IE < 9, '\v' == 'v'.
  // '\v': '\\x0B'
};
const regexSingleEscape = /[\\\b\f\n\r\t]/;
const regexDigit = /[0-9]/;
const regexWhitespace = /[\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;
const escapeEverythingRegex = /([\uD800-\uDBFF][\uDC00-\uDFFF])|([\uD800-\uDFFF])|(['"`])|[^]/g;
const escapeNonAsciiRegex = /([\uD800-\uDBFF][\uDC00-\uDFFF])|([\uD800-\uDFFF])|(['"`])|[^ !#-&\(-\[\]-_a-~]/g;
const jsesc = (argument, options) => {
  const increaseIndentation = () => {
    oldIndent = indent;
    ++options.indentLevel;
    indent = options.indent.repeat(options.indentLevel);
  };
  const defaults = {
    "escapeEverything": false,
    "minimal": false,
    "isScriptContext": false,
    "quotes": "single",
    "wrap": false,
    "es6": false,
    "json": false,
    "compact": true,
    "lowercaseHex": false,
    "numbers": "decimal",
    "indent": "	",
    "indentLevel": 0,
    "__inline1__": false,
    "__inline2__": false
  };
  const json = options && options.json;
  if (json) {
    defaults.quotes = "double";
    defaults.wrap = true;
  }
  options = extend(defaults, options);
  if (options.quotes != "single" && options.quotes != "double" && options.quotes != "backtick") {
    options.quotes = "single";
  }
  const quote = options.quotes == "double" ? '"' : options.quotes == "backtick" ? "`" : "'";
  const compact = options.compact;
  const lowercaseHex = options.lowercaseHex;
  let indent = options.indent.repeat(options.indentLevel);
  let oldIndent = "";
  const inline1 = options.__inline1__;
  const inline2 = options.__inline2__;
  const newLine = compact ? "" : "\n";
  let result;
  let isEmpty = true;
  const useBinNumbers = options.numbers == "binary";
  const useOctNumbers = options.numbers == "octal";
  const useDecNumbers = options.numbers == "decimal";
  const useHexNumbers = options.numbers == "hexadecimal";
  if (json && argument && isFunction(argument.toJSON)) {
    argument = argument.toJSON();
  }
  if (!isString(argument)) {
    if (isMap(argument)) {
      if (argument.size == 0) {
        return "new Map()";
      }
      if (!compact) {
        options.__inline1__ = true;
        options.__inline2__ = false;
      }
      return "new Map(" + jsesc(Array.from(argument), options) + ")";
    }
    if (isSet(argument)) {
      if (argument.size == 0) {
        return "new Set()";
      }
      return "new Set(" + jsesc(Array.from(argument), options) + ")";
    }
    if (isBuffer(argument)) {
      if (argument.length == 0) {
        return "Buffer.from([])";
      }
      return "Buffer.from(" + jsesc(Array.from(argument), options) + ")";
    }
    if (isArray(argument)) {
      result = [];
      options.wrap = true;
      if (inline1) {
        options.__inline1__ = false;
        options.__inline2__ = true;
      }
      if (!inline2) {
        increaseIndentation();
      }
      forEach(argument, (value) => {
        isEmpty = false;
        if (inline2) {
          options.__inline2__ = false;
        }
        result.push(
          (compact || inline2 ? "" : indent) + jsesc(value, options)
        );
      });
      if (isEmpty) {
        return "[]";
      }
      if (inline2) {
        return "[" + result.join(", ") + "]";
      }
      return "[" + newLine + result.join("," + newLine) + newLine + (compact ? "" : oldIndent) + "]";
    } else if (isNumber(argument)) {
      if (json) {
        return JSON.stringify(argument);
      }
      if (useDecNumbers) {
        return String(argument);
      }
      if (useHexNumbers) {
        let hexadecimal2 = argument.toString(16);
        if (!lowercaseHex) {
          hexadecimal2 = hexadecimal2.toUpperCase();
        }
        return "0x" + hexadecimal2;
      }
      if (useBinNumbers) {
        return "0b" + argument.toString(2);
      }
      if (useOctNumbers) {
        return "0o" + argument.toString(8);
      }
    } else if (!isObject(argument)) {
      if (json) {
        return JSON.stringify(argument) || "null";
      }
      return String(argument);
    } else {
      result = [];
      options.wrap = true;
      increaseIndentation();
      forOwn(argument, (key, value) => {
        isEmpty = false;
        result.push(
          (compact ? "" : indent) + jsesc(key, options) + ":" + (compact ? "" : " ") + jsesc(value, options)
        );
      });
      if (isEmpty) {
        return "{}";
      }
      return "{" + newLine + result.join("," + newLine) + newLine + (compact ? "" : oldIndent) + "}";
    }
  }
  const regex = options.escapeEverything ? escapeEverythingRegex : escapeNonAsciiRegex;
  result = argument.replace(regex, (char, pair, lone, quoteChar, index, string) => {
    if (pair) {
      if (options.minimal) return pair;
      const first = pair.charCodeAt(0);
      const second = pair.charCodeAt(1);
      if (options.es6) {
        const codePoint = (first - 55296) * 1024 + second - 56320 + 65536;
        const hex2 = hexadecimal(codePoint, lowercaseHex);
        return "\\u{" + hex2 + "}";
      }
      return fourHexEscape(hexadecimal(first, lowercaseHex)) + fourHexEscape(hexadecimal(second, lowercaseHex));
    }
    if (lone) {
      return fourHexEscape(hexadecimal(lone.charCodeAt(0), lowercaseHex));
    }
    if (char == "\0" && !json && !regexDigit.test(string.charAt(index + 1))) {
      return "\\0";
    }
    if (quoteChar) {
      if (quoteChar == quote || options.escapeEverything) {
        return "\\" + quoteChar;
      }
      return quoteChar;
    }
    if (regexSingleEscape.test(char)) {
      return singleEscapes[char];
    }
    if (options.minimal && !regexWhitespace.test(char)) {
      return char;
    }
    const hex = hexadecimal(char.charCodeAt(0), lowercaseHex);
    if (json || hex.length > 2) {
      return fourHexEscape(hex);
    }
    return "\\x" + ("00" + hex).slice(-2);
  });
  if (quote == "`") {
    result = result.replace(/\$\{/g, "\\${");
  }
  if (options.isScriptContext) {
    result = result.replace(/<\/(script|style)/gi, "<\\/$1").replace(/<!--/g, json ? "\\u003C!--" : "\\x3C!--");
  }
  if (options.wrap) {
    result = quote + result + quote;
  }
  return result;
};
jsesc.version = "3.0.2";
var jsesc_1 = jsesc;
const jsesc$1 = /* @__PURE__ */ getDefaultExportFromCjs(jsesc_1);
let defaultOptions = {
  explicit: false
};
let ids = /* @__PURE__ */ new Set();
function importJSXAsString(options = defaultOptions) {
  options = Object.assign({}, defaultOptions, options);
  return {
    name: "rollup-plugin-import-extendscript",
    load(id) {
      let name = basename(id);
      let isDestined = name.includes("?extendscript");
      if (!isDestined) {
        return void 0;
      }
      id = isDestined ? id.replace("?extendscript", "") : id;
      let content = "";
      try {
        content = readFileSync(id, "utf8");
      } catch (e) {
        console.error(`ExtendScript vite plugin: Error reading file ${id}`);
        return "export default ''";
      }
      let isJSX = name.includes(".jsx");
      let isJSXBIN = name.includes(".jsxbin");
      let isKnownFormat = isJSX || isJSXBIN;
      if (options.explicit && !isKnownFormat) {
        throw new Error(`The file ${name} is not a known format. Please use a .jsx or .jsxbin file, or set the explicit option to false in vite.config.js`);
      }
      if (isJSXBIN) {
        throw new Error(`The file ${name} is a jsxbin file. This plugin can't process jsxbin files.`);
      }
      content = fileresolve(id, content);
      const escapedContent = jsesc$1(content, {
        wrap: true,
        quotes: "backtick",
        json: true,
        indentLevel: 2,
        // Use 2 spaces for indentation
        compact: false,
        // Don't compact the output
        minimal: false
        // Don't use the shortest possible escape sequences
      });
      const wrapped = `export default ${escapedContent};`;
      ids.add(id);
      return wrapped;
    },
    async writeBundle() {
      ids.forEach((id) => {
        console.log(`✓ ${basename(id)}`, ` as a string`);
      });
    }
  };
}
export {
  importJSXAsString as default
};
