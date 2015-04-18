/// <reference path="./typings/tsd.d.ts" />
/// <reference path="./typescript_definition.d.ts" />
"use strict";

import nodeunit = require("nodeunit");
import typescript_definition = require("./typescript_definition");

export module Defs {
  export interface File {
    
  }
  
  export enum Type {
    WHITESPACE = 0,
    MODULE = 1,
    INTERFACE = 2
  }
  
  export interface Base {
    type: Type;
  }
  
  export interface WhiteSpace extends Base {
    value: string;
  }
  
  export interface Module extends Base {
    name: string;
    members: Base[];
  }
  
  export interface Interface extends Base {
    name: string;
    extends: string[];
    members: Base[];
  }
}


export function parse(text: string): Defs.File {
  return typescript_definition.parse(text);
}

export function toString(defs: Defs.File): string {
  return "";
}
