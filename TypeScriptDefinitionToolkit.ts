/// <reference path="./typings/tsd.d.ts" />
/// <reference path="./typescript_definition.d.ts" />
"use strict";

import nodeunit = require("nodeunit");
import typescript_definition = require("./typescript_definition");

export interface DefinitionFile {
  
}

export function parse(text: string): DefinitionFile {
  return typescript_definition.parser.parse(text);
}

export function toString(defs: DefinitionFile): string {
  return "";
}
