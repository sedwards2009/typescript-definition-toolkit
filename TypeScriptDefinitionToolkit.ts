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
    IMPORT_DECLARATION = 8,
    METHOD = 9,
    PROPERTY = 10,
    TYPE_ALIAS = 11,
    INDEX_METHOD = 12,
    TYPE_PARAMETER = 13,
    TUPLE_TYPE = 14,
    EXPORT_ASSIGNMENT = 15,
    CLASS_DECLARATION = 16,
    AMBIENT_VARIABLE = 17,
    ENUM = 18,
    ENUM_MEMBER = 19,
    UNION_TYPE = 20,
    SPECIALIZED_SIGNATURE = 21,
    TYPE_QUERY = 22,
    CONSTRUCTOR_TYPE = 23
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
    external: boolean;
  }
  
  export interface Interface extends Base {
    ambient: boolean;
    name: string;
    typeParameters: TypeParameter[];
    extends: ObjectTypeRef[];
    objectType: ObjectType;
    export: boolean;
  }
  
  export interface Function extends Base {
    name: string;
    signature: FunctionType;
    ambient: boolean;
  }
  
  export interface FunctionType extends Base {
    typeParameters: TypeParameter[];
    returnType: PrimaryType;
    parameters: Parameter[];
  }
  
  export interface Parameter extends Base {
    name: string;
    accessibility: string;
    required: boolean;
    rest: boolean;
    initialiser: string;
    parameterType: PrimaryType | SpecializedSignature;
  }
  
  export interface TypeParameter extends Base {
    name: string;
    extends: PrimaryType;
  }
  
  export interface SpecializedSignature extends Base {
    value: string;
  } 

  // -- Types
  export interface PrimaryType extends Base {
  }
  
  export interface ObjectType extends PrimaryType {
    members: Base[];
  }
  
  export interface ObjectTypeRef extends PrimaryType {
    name: string;
    typeArguments: PrimaryType[];
  }
  
  export interface TupleType extends PrimaryType {
    members: PrimaryType[];
  }
  
  export interface UnionType extends PrimaryType {
    members: PrimaryType[];
  }
  
  export interface TypeQuery extends PrimaryType {
    value: string;
  }
  
  export interface ConstructorType extends PrimaryType {
    typeParameters: TypeParameter[];
    returnType: PrimaryType;
    parameters: Parameter[];
  }
  
  // FIXME add an array type??
  // -- end types.
    
  export interface ImportDeclaration extends Base {
    name: string;
    externalModule: string;
    export: boolean;
    external: boolean;
  }
  
  export interface Method extends Base {
    name: string;
    optional: boolean;
    signature: FunctionType;
    static: boolean;
    access: string;
  }
  
  export interface Property extends Base {
    name: string;
    optional: boolean;
    signature: FunctionType | PrimaryType;
    static: boolean;
    access: string;
  }
  
  export interface TypeAlias extends Base {
    ambient: boolean;
    name: string;
    entity: ObjectType | ObjectTypeRef;
  }
  
  export interface IndexMethod extends Base {
    index: Parameter;
    returnType: PrimaryType;
  }
  
  export interface ExportAssignment extends Base {
    name: string;
  }
  
  export interface AmbientVariable extends Base {
    name: string;
    signature: FunctionType | PrimaryType;
  }
  
  export interface ClassDeclaration extends Base {
    name: string;
    typeParameters: TypeParameter[];
    members: Base[];
    ambient: boolean;
    extends: ObjectTypeRef;
    implements: ObjectTypeRef[];
  }
  
  export interface Enum extends Base {
    name: string;
    members: EnumMember[];
    export: boolean;
    ambient: boolean;
    constant: boolean;
  }
  
  export interface EnumMember extends Base {
    name: string;
    value: string;
  }
}


export function parse(text: string): Defs.Base[] {
  return typescript_definition.parse(text);
}

export function toString(obj: Defs.Base, level: number=0, indent: string = "    "): string {
  let result: string;
  let dent: string = "";
  for (let i=level; i>0; i--) {
    dent += indent;
  }
  
  switch (obj.type) {
      case Defs.Type.WHITESPACE:
        let ws = <Defs.WhiteSpace> obj;
        return ws.value;
        break;
        
      case Defs.Type.MODULE:
        let mod = <Defs.Module> obj;
        return dent + (mod.ambient ? "declare " : "") + (mod.export ? "export " : "") +
          "module " + (mod.external ? "'" + mod.name + "'" : mod.name) + " {\n" + listToString(mod.members, level+1) + "}\n";
        break;
        
      case Defs.Type.INTERFACE:
        let inter = <Defs.Interface> obj;
        result = dent + (inter.ambient ? "declare " : "") + (inter.export ? "export " : "");
        result += "interface " + inter.name;
          
        if (inter.typeParameters !== null && inter.typeParameters.length !==0) {
          result += "<";
          result += inter.typeParameters.map( (p) => toString(p) ).join(", ");
          result += ">";
        }
        
        if (inter.extends !== null && inter.extends.length !== 0) {
          result += " extends " + inter.extends.map( (e) => toString(e) ).join(", ");
        }
        
        result += " {\n" + listToString(inter.objectType.members, level+1) + "\n" + dent + "}\n";
        return result;
        break;
        
      case Defs.Type.FUNCTION:
        let func = <Defs.Function> obj;
        return dent + (func.ambient ? "declare " : "") + "function " + func.name + toString(func.signature) + ";";
        break;
        
      case Defs.Type.FUNCTION_TYPE:
        let funcType = <Defs.FunctionType> obj;

        result = "";
        if (funcType.typeParameters !== null && funcType.typeParameters.length !==0) {
          result += "<";
          result += funcType.typeParameters.map( (p) => toString(p) ).join(", ");
          result += ">";
        }
        
        result += "(";
        result += funcType.parameters.map( (p) => toString(p, level, indent) ).join(", ");
        result += ")";
        result += (funcType.returnType !== null ? (": "+ toString(funcType.returnType)) : "");
        return result;
        break;
        
      case Defs.Type.PARAMETER:
        let param = <Defs.Parameter> obj;
        return (param.rest ? "..." : "") + param.name +
                (param.required === false && param.rest === false ? "?" :"") +
                (param.parameterType !== null ? ": " + toString(param.parameterType) : "");
        break;
        
      case Defs.Type.OBJECT_TYPE:
        let objType = <Defs.ObjectType> obj;
        return "{" + listToString(objType.members, level+1, indent) + "}";
        break;
        
      case Defs.Type.OBJECT_TYPE_REF:
        let objTypeRef = <Defs.ObjectTypeRef> obj;
        result = objTypeRef.name;
        if (objTypeRef.typeArguments !== null && objTypeRef.typeArguments.length !== 0) {
          result += "<";
          result += objTypeRef.typeArguments.map( (a) => toString(a) ).join(",");
          result += ">";
        }
        return result;
        break;
        
      case Defs.Type.TYPE_QUERY:
        let typeQuery = <Defs.TypeQuery> obj;
        return "typeof " + typeQuery.value;
        break;
        
      case Defs.Type.IMPORT_DECLARATION:
        let dec = <Defs.ImportDeclaration> obj;
        return dent + (dec.export ? "export " : "") + "import " + dec.name + " = " +
          (dec.external ? "require('"+ dec.externalModule + "')" : dec.externalModule) + ";\n";
        break;
        
      case Defs.Type.METHOD:
        let method = <Defs.Method> obj;
        result = dent;
        result += method.access !== null ? method.access + " " : "";
        result += method.static ? "static " : "";
        result += method.name;
        result += method.optional ? "?" :"";
        result += toString(method.signature);
        result += ";";
        return result;
        break;
        
      case Defs.Type.PROPERTY:
        let prop = <Defs.Property> obj;
        result = dent;
        result += prop.access !== null ? prop.access + " " : "";
        result += prop.name;
        result += prop.optional ? "?" : "";
        result += prop.signature === null ? "" : ": " + toStringFunctionSignature(prop.signature);
        result += ";";
        return result;
        break;
        
      case Defs.Type.TYPE_ALIAS:
        let typeAlias = <Defs.TypeAlias> obj;
        return dent + (typeAlias.ambient ? "declare " : "") + "type " + typeAlias.name + " = " + toString(typeAlias.entity) + ";";
        break;
        
      case Defs.Type.INDEX_METHOD:
        let indexMethod = <Defs.IndexMethod> obj;
        return dent + "[" + toString(indexMethod.index) + "]: " + toString(indexMethod.returnType) + ";";
        break;
        
      case Defs.Type.TYPE_PARAMETER:
        let typeParameter = <Defs.TypeParameter> obj;
        return typeParameter.name + ( typeParameter.extends !== null ? " extends " + toString(typeParameter.extends) : "");
        break;
        
      case Defs.Type.TUPLE_TYPE:
        let tuple = <Defs.TupleType> obj;
        return "[" + tuple.members.map( (t) => toString(t, level+1, indent) ).join(", ") + "]";
        break;
        
      case Defs.Type.UNION_TYPE:
        let union = <Defs.UnionType> obj;
        return union.members.map( (m) => toString(m) ).join("|");
        break;
          
      case Defs.Type.EXPORT_ASSIGNMENT:
        let exportAssign = <Defs.ExportAssignment> obj;
        return dent + "export = " + exportAssign.name + ";\n";
        break;
        
      case Defs.Type.AMBIENT_VARIABLE:
        let ambientVariable = <Defs.AmbientVariable> obj;
        return dent + "declare var " + ambientVariable.name +
          (ambientVariable.signature === null ? "" : ": " + toStringFunctionSignature(ambientVariable.signature)) +  ";\n";
        break;
        
      case Defs.Type.CLASS_DECLARATION:
        let classDec = <Defs.ClassDeclaration> obj;
        result = dent;
        result += classDec.ambient ? "declare " : "";
        result += "class " + classDec.name;

        if (classDec.typeParameters !== null && classDec.typeParameters.length !== 0) {
          result += "<" + listToString(classDec.typeParameters) + ">";
        }

        if (classDec.extends !== null) {
          result += " extends " + toString(classDec.extends);
        }
        if (classDec.implements !== null && classDec.implements.length !== 0) {
          result += " implements " + classDec.implements.map( (i) => toString(i)).join(", ");
        }
        result += " {\n" + listToString(classDec.members, level+1, indent) + "}\n";
        return result;
        break;
        
      case Defs.Type.ENUM:
        let enumDecl = <Defs.Enum> obj;
        result = "";
        result += dent;
        if (enumDecl.ambient) {
          result += "declare ";
        }
        if (enumDecl.export) {
          result += "export ";
        }
        if (enumDecl.constant) {
          result += "const ";
        }
        result += "enum ";
        result += enumDecl.name;
        result += " {\n";
        result += enumDecl.members.map( (m) => indent + dent + m.name + (m.value !== null ? " = " + m.value : "") ).join(",\n");
        result += "\n";
        result += dent;
        result += "}\n";
        return result;
        break;
        
      case Defs.Type.SPECIALIZED_SIGNATURE:
        let specicalizedSignature = <Defs.SpecializedSignature> obj;
        return '"' + specicalizedSignature.value + '"';
        break;
        
      case Defs.Type.CONSTRUCTOR_TYPE:
        let constructorType = <Defs.FunctionType> obj;

        result = "new";
        if (constructorType.typeParameters !== null && constructorType.typeParameters.length !==0) {
          result += "<";
          result += constructorType.typeParameters.map( (p) => toString(p) ).join(", ");
          result += ">";
        }
        
        result += "(";
        result += constructorType.parameters.map( (p) => toString(p, level, indent) ).join(", ");
        result += ")";
        result += (constructorType.returnType !== null ? (" => "+ toString(constructorType.returnType)) : "");
        return result;
        break;

  }
  return "";
}

export function listToString(obj: Defs.Base[], level: number=0, indent: string = "    "): string {
  if (obj === null) {
    return "";
  }
  return obj.map( (item) => toString(item, level, indent) ).join("");
}

export function toStringFunctionSignature(obj: Defs.Base, level: number=0,
    indent: string = "    "): string {
      
  let result: string;
  
  switch (obj.type) {
      case Defs.Type.FUNCTION_TYPE:
        let funcType = <Defs.FunctionType> obj;
        result = "";
        if (funcType.typeParameters !== null && funcType.typeParameters.length !==0) {
          result += "<";
          result += funcType.typeParameters.map( (p) => toString(p) ).join(", ");
          result += ">";
        }
        result += "(";
        result += funcType.parameters.map( (p) => toString(p, level, indent) ).join(", ");
        result += ")";
        result += (funcType.returnType !== null ? (" => "+ toString(funcType.returnType)) : " => any");
        return result;
        break;

      default:
        return toString(obj, level, indent);
  }
}
