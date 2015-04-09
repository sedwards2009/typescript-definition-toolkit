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
  const defs = toolkit.parse(text);
  console.log(JSON.stringify(defs));
  // const newText = toolkit.toString(defs);
  // test.equal(newText, text);
  test.done();
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
  roundTrip(test, `module "FooBarMod" {
    
  }
`);
}

export function testAmbientModule2(test: nodeunit.Test): void {
  roundTrip(test, `module 'FooBarMod' {
    
  }
`);
}

export function testImport(test: nodeunit.Test): void {
  roundTrip(test, `module 'FooBarMod' {
    import otherModule = require('otherModule');
  }
`);
}

export function testExportImport(test: nodeunit.Test): void {
  roundTrip(test, `module 'FooBarMod' {
    export import otherModule = require('otherModule');
  }
`);
}
