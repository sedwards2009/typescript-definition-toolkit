/// <reference path="./typings/tsd.d.ts" />
/// <reference path="./typescript_definition.d.ts" />
"use strict";

import nodeunit = require("nodeunit");
import typescript_definition = require("./typescript_definition");

export module Defs {
  
  export enum Type {
    WHITESPACE = 0,
    MODULE = 1,
    INTERFACE = 2,
    FUNCTION = 3,
    FUNCTION_TYPE = 4,
    PARAMETER = 5,
    OBJECT_TYPE = 6,
    OBJECT_TYPE_REF = 7,
    IMPORT_DECLARATION = 8
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
    ambient: boolean;
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
  
  export interface ImportDeclaration extends Base {
    name: string;
    externalModule: string;
  }
}


export function parse(text: string): Defs.Base[] {
  return typescript_definition.parse(text);
}

export function toString(obj: Defs.Base): string {
  
  switch (obj.type) {
      case Defs.Type.WHITESPACE:
        let ws = <Defs.WhiteSpace> obj;
        return ws.value;
        break;
        
      case Defs.Type.MODULE:
        let mod = <Defs.Module> obj;
        return (mod.ambient ? "declare " : "") + (mod.export ? "export " : "") +"module " + mod.name + " {\n" + listToString(mod.members) + "}\n";
        break;
        
      case Defs.Type.INTERFACE:
        let inter = <Defs.Interface> obj;
        return (inter.ambient ? "declare " : "") + (inter.export ? "export " : "") + "interface " + inter.name + " {\n" + listToString(inter.members) + "}\n";
        break;
        
      case Defs.Type.FUNCTION:
        break;
        
      case Defs.Type.FUNCTION_TYPE:
        break;
        
      case Defs.Type.PARAMETER:
        break;
        
      case Defs.Type.OBJECT_TYPE:
        break;
        
      case Defs.Type.OBJECT_TYPE_REF:
        break;
        
      case Defs.Type.IMPORT_DECLARATION:
        let dec = <Defs.ImportDeclaration> obj;
        return "import " + dec.name + " = " + dec.externalModule + ";\n";
        break;
        
  }
  return "";
}

export function listToString(obj: Defs.Base[]): string {
  if (obj === null) {
    return "";
  }
  return obj.map( (x) => toString(x) ).join("");
}
