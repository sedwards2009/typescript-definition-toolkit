/**
 * Tests for the typescript-definition-parser
 *
 */
/// <reference path="./typings/tsd.d.ts" />
/// <reference path="./typescript_definition.d.ts" />
"use strict";

import nodeunit = require("nodeunit");
import toolkit = require("./TypeScriptDefinitionToolkit");

function roundTrip(test: nodeunit.Test, text: string): void {
  try {
    const defs = toolkit.parse(text);
    let newText = toolkit.listToString(defs);
    
    if (normalizeWhiteSpace(text) !== normalizeWhiteSpace(newText)) {
      console.log(JSON.stringify(defs));
      console.log("-IN---------------------------------------------------------");
      console.log(text);
      // console.log(normalizeWhiteSpace(text));
      console.log("-OUT--------------------------------------------------------");
      console.log(newText);
      // console.log(normalizeWhiteSpace(newText));
      console.log("------------------------------------------------------------");
    }
    // const newText = toolkit.toString(defs);
    // test.equal(newText, text);
  } catch(e) {
    console.log("------------------------------------------------------------");
    console.log("Failed to parse input: ");
    console.log(text);
    console.log("----------");
    console.log(e);
    test.equals(false, true, "Exception thrown during parse.");
    test.done();
    return;
  }
  test.equals(true, true, "");
  test.done();
}

function parseTest(test: nodeunit.Test, text: string): void {
  try {
    const defs = toolkit.parse(text);
  } catch(e) {
    console.log("------------------------------------------------------------");
    console.log("Failed to parse input: ");
    console.log(text);
    console.log("----------");
    console.log(e);
    test.equals(false, true, "Exception thrown during parse.");
    test.done();
    return;
  }
  test.equals(true, true, "");
  test.done();
}

function normalizeWhiteSpace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function testEmpty(test: nodeunit.Test): void {
  roundTrip(test, "");
}

export function testComment(test: nodeunit.Test): void {
  roundTrip(test, `// A line comment
`);
}

export function test2Comment(test: nodeunit.Test): void {
  roundTrip(test, `// A line comment 1

// A line comment 2
`);
}

export function testMultiComment(test: nodeunit.Test): void {
  roundTrip(test, `/*  Red fish,
  Blue fish,
  one fish,
  two fish
*/
`);
}

export function testExport(test: nodeunit.Test): void {
  roundTrip(test, `export = Foobar;
`);
}

export function testAmbientModule(test: nodeunit.Test): void {
  roundTrip(test, `declare module FooBarMod {
    
  }
`);
}

export function testAmbientModule2(test: nodeunit.Test): void {
  roundTrip(test, `declare module FooBarMod {
    
  }
`);
}

export function testImport(test: nodeunit.Test): void {
  roundTrip(test, `import otherModule = require('otherModule');`);
}

export function testInterface(test: nodeunit.Test): void {
  roundTrip(test, `
    export interface Baz extends smeg.Foo {
    }
`);
}

export function testInterface2(test: nodeunit.Test): void {
  roundTrip(test, `
    export interface Baz {
      aMethod(): void;
      
      // Just a comment
      
      anotherMethod(): void;
    }
`);
}

export function testInterface3(test: nodeunit.Test): void {
  roundTrip(test, `
    export interface Baz {
      aMethod(): void;
      anotherMethod(): void;
      // Just a comment
    }
`);
}

export function testInterface4(test: nodeunit.Test): void {
  roundTrip(test, `
    export interface Baz {
      // Just a comment
      // Just a comment
      aMethod(): void;
      anotherMethod(): void;
      // Just a comment
      // Just a comment
    }
`);
}

export function testStringLiteralName(test: nodeunit.Test): void {
  roundTrip(test, `export interface Baz {
    	"Funny name": string;
    }`);
}

export function testParameterStringMatch(test: nodeunit.Test): void {
  roundTrip(test, `declare function foo(bar: "smeg"): string;`);
}

export function testTuple(test: nodeunit.Test): void {
  roundTrip(test, `
    export interface Baz {
    	pair: [string, number];
    }    
`);
}

export function testGenerics(test: nodeunit.Test): void {
  roundTrip(test, `
    export interface Baz<T, X> {
    	pair(): T;
      xxor(): X;
    }    
`);
}

export function testGenerics2(test: nodeunit.Test): void {
  roundTrip(test, `
    export interface Baz {
    	pair<T, X>(x: X): T;
    }    
`);
}

export function testInterfaceMethod(test: nodeunit.Test): void {
  roundTrip(test, `
    export interface Baz {
      bop();
    }
`);
}

export function testInterfaceMethod2(test: nodeunit.Test): void {
  roundTrip(test, `
    export interface Baz {
      bop();
      pop();
    }
`);
}

export function testInterfaceMethod2Args(test: nodeunit.Test): void {
  roundTrip(test, `
    export interface Baz {
      bop(times, message);
    }
`);
}

export function testInterfaceMethod3(test: nodeunit.Test): void {
  roundTrip(test, `
    export interface Baz {
      bop(times: number): void;
    }
`);
}

export function testInterfaceMethod4(test: nodeunit.Test): void {
  roundTrip(test, `
    export interface Baz {
      bop(times?: number): void;
    }
`);
}

export function testInterfaceMethod5(test: nodeunit.Test): void {
  roundTrip(test, `export interface Baz {
  bop(...times: number[]): void;
}`);
}

export function testInterfaceNew(test: nodeunit.Test): void {
  roundTrip(test, `export interface Baz {
  new();
}`);
}

export function testInterfaceNew2(test: nodeunit.Test): void {
  roundTrip(test, `export interface Baz {
  new(baz);
}`);
}

export function testInterfaceNew3(test: nodeunit.Test): void {
  roundTrip(test, `export interface Baz {
  new(baz?);
}`);
}

export function testInterfaceNew4(test: nodeunit.Test): void {
  roundTrip(test, `export interface Baz {
  new(baz?: number);
}`);
}

export function testInterfaceDefault(test: nodeunit.Test): void {
  roundTrip(test, `export interface Baz {
  ();
}`);
}

export function testInterfaceDefault2(test: nodeunit.Test): void {
  roundTrip(test, `export interface Baz {
  (baz);
}`);
}

export function testInterfaceDefault3(test: nodeunit.Test): void {
  roundTrip(test, `export interface Baz {
  (baz?);
}`);
}

export function testInterfaceDefault4(test: nodeunit.Test): void {
  roundTrip(test, `export interface Baz {
  (baz?: number);
}`);
}

export function testInterfaceIndex(test: nodeunit.Test): void {
  roundTrip(test, `export interface Baz {
  [i: number]: string;
}`);
}

export function testInterfaceIndex2(test: nodeunit.Test): void {
  roundTrip(test, `export interface Baz {
  [i: string]: string;
}`);
}

export function testInterfaceFunctionType(test: nodeunit.Test): void {
  roundTrip(test, `export interface Baz {
  bar: (e) => any;
}`);
}

export function testInterfaceGenerics(test: nodeunit.Test): void {
  roundTrip(test, `export interface Baz {
  baz: () => Promise<Candy>;
}`);
}

export function testVarFunctionType(test: nodeunit.Test): void {
  roundTrip(test, `declare var bar: (e) => any;`);
}


export function testTypeAlias(test: nodeunit.Test): void {
  roundTrip(test, `type foo = bar;`);
}

export function testTypeAlias2(test: nodeunit.Test): void {
  roundTrip(test, `type strings = string|string[];`);
}

export function testTypeAliasInModule(test: nodeunit.Test): void {
  roundTrip(test, `declare module "foo" {
  type strings = string|string[];
}`);
}

export function testBuiltinTypeNameCollision(test: nodeunit.Test): void {
  roundTrip(test, `declare var foo: strings;`);
}

export function testImportDeclaration(test: nodeunit.Test): void {
  roundTrip(test, `import foo = bar;`);
}

export function testAmbientFunction(test: nodeunit.Test): void {
  roundTrip(test, `declare function bop(times: number): void;`);
}

export function testAmbientFunction2(test: nodeunit.Test): void {
  roundTrip(test, `declare function bop(times, blah?): void;`);
}

export function testAmbientFunction3(test: nodeunit.Test): void {
  roundTrip(test, `declare function bop(times, blah?: number): void;`);
}

export function testAmbientFunction4(test: nodeunit.Test): void {
  roundTrip(test, `declare function bop(blah?: number);`);
}

export function testDeclareModule(test: nodeunit.Test): void {
  roundTrip(test, `declare module 'foo' {

}`);
}

export function testCommentsInsideModule(test: nodeunit.Test): void {
  roundTrip(test, `declare module 'foo' {
  // This is just a comment.
}`);
}

export function testOptionalParameters(test: nodeunit.Test): void {
  roundTrip(test, `declare module 'foobar' {
	 interface Test {
  	  	baz(block: any, error?: any, message?: string): void;
  	}
}`);
}

export function testTypeRefInBrackets(test: nodeunit.Test): void {
  roundTrip(test, `export interface Baz {
    (callback: Test): void;
}
`);
}

export function testArrow(test: nodeunit.Test): void {
  roundTrip(test, `export interface Foo {
    baz: () => void;
}
`);
}

export function testAmbientVar(test: nodeunit.Test): void {
  roundTrip(test, `declare var foobar: string;
`);
}

export function testAmbientClass(test: nodeunit.Test): void {
  roundTrip(test, `declare class Foobar {
  smeg(): string;
}
`);
}

export function testAmbientClassProperty(test: nodeunit.Test): void {
  roundTrip(test, `declare class Foobar {
  beastie: string;
}
`);
}

export function testClassStatic(test: nodeunit.Test): void {
  roundTrip(test, `declare class Foobar {
  static smeg(): string;
}
`);
}

export function testModuleClass(test: nodeunit.Test): void {
  roundTrip(test, `declare module Foo {
    class Bar {
    }  
  }
`);  
}

export function testAmbientClassExtends(test: nodeunit.Test): void {
  roundTrip(test, `declare class Foobar extends FooBase {
}
`);
}

export function testAmbientClassImplements(test: nodeunit.Test): void {
  roundTrip(test, `declare class Foobar implements IFoo, ISmeg {
}
`);
}

export function testAmbientEnum(test: nodeunit.Test): void {
  roundTrip(test, `declare enum Colors {
  RED = 0,
  GREEN,
  BLUE
}`);
}

export function testAmbientVar2(test: nodeunit.Test): void {
  roundTrip(test, `declare module Foo {
  var smeg: {
    blah: string;
  };
}`);
}

export function testShortAmbientVar(test: nodeunit.Test): void {
  parseTest(test, `declare module Foo {
  var smeg: {
    blah: string
  }
}`);
}

export function testMissingSemi(test: nodeunit.Test): void {
  parseTest(test, `interface Foo {
  smeg: {
      foz: number;
  }
  bar: string;
}`);
}

export function testMissingSemiInModule(test: nodeunit.Test): void {
  parseTest(test, `declare module Foo {
  function bar(): smeg
}`);
}

export function testCallSignature(test: nodeunit.Test): void {
  parseTest(test, `declare var smeg: { ():string; };`);
}

export function testUnionWithSpaces(test: nodeunit.Test): void {
  parseTest(test, `declare var bar: string | number;`);
}

export function testInterfaceNoLastSemi(test: nodeunit.Test): void {
  parseTest(test, `interface Foo {
  bar(): void}`);
}

export function testModuleWithInterfaces(test: nodeunit.Test): void {
  roundTrip(test, `declare module Foo {
  export interface Bar {
    fooIt(): void;
  }
  
  export interface Baz {
    bing(): void;
  }
}`);
}

// const defs = toolkit.parse(`declare module Foo {
// export interface Bar {
//   fooIt(): void;
// }
// 
// export interface Baz {
//   bing(): void;
// }
// }`);
// console.log(JSON.stringify(defs));
// console.log(toolkit.listToString(defs));
