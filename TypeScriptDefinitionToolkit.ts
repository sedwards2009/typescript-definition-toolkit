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
    INTERFACE = 2,
    FUNCTION = 3,
    FUNCTION_TYPE = 4,
    PARAMETER = 5,
    OBJECT_TYPE = 6,
    OBJECT_TYPE_REF = 7
  }
  
  export interface Base {
    type: Type;
  }
  
  export interface WhiteSpace extends Base {
    value: string;
  }
  
  export interface Module extends Base {
    name: string;
    ambient: boolean;
    export: boolean;
    members: Base[];
  }
  
  export interface Interface extends Base {
    name: string;
    extends: string[];
    members: Base[];
    export: boolean;
  }
  
  export interface Function extends Base {
    name: string;
    signature: FunctionType;
  }
  
  export interface FunctionType extends Base {
    typeParameters: string[];
    returnType: ObjectType | ObjectTypeRef;
    parameters: string[];
  }
  
  export interface Parameter extends Base {
    name: string;
    accessibility: string;
    required: boolean;
    initialiser: string;
    parameterType: ObjectType | ObjectTypeRef;
  }
  
  export interface ObjectType extends Base {
    
  }
  
  export interface ObjectTypeRef extends Base {
    
  }
}


export function parse(text: string): Defs.File {
  return typescript_definition.parse(text);
}

export function toString(defs: Defs.File): string {
  return "";
}
