# typescript-definition-toolkit
A simple parser and toolkit for TypeScript definition files for use by people who want to mangle and transform .d.ts files.

Features:
* Can parse TypeScript definition files. :thumbsup:
* Can successfully parse every *.d.ts file on [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped).
* Parse result is relatively simple tree which can manually searched or modified. (See the start of `TypeScriptDefinitionToolkit.ts` for the interface definitions.)
* `toString()` function takes a parse tree and converts it to a .d.ts text.
* Extra functions in the toolkit allow for transformations on class and interface definitions.

