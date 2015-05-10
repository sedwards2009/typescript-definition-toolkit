/*
 * Copyright 2015 Simon Edwards <simon@simonzone.com>
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 *    limitations under the License.
 */
"use strict";

import nodeunit = require("nodeunit");
import typescript_definition = require("./typescript_definition");

export module Defs {
  
  /**
   * Each object in the tree is tagged with this enum to identify its type.
   */
  export const enum Type {
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
    CLASS = 16,
    AMBIENT_VARIABLE = 17,
    ENUM = 18,
    ENUM_MEMBER = 19,
    UNION_TYPE = 20,
    SPECIALIZED_SIGNATURE = 21,
    TYPE_QUERY = 22,
    CONSTRUCTOR_TYPE = 23,
    ARRAY_TYPE = 24
  }
  
  /**
   * Base interface for all types which appear in the tree.
   */
  export interface Base {
    type: Type;
  }
  
  /**
   * White space and may be mixed with comments.
   */
  export interface WhiteSpace extends Base {
    /**
     * The white space text possibly with embedded comments.
     */
    value: string;
  }
  
  /**
   * Module
   */
  export interface Module extends Base {
    /**
     * Name of the module.
     */
    name: string;
    
    /**
     * True if this module is an ambient module.
     */
    ambient: boolean;
    
    /**
     * True if this module is exported.
     */
    export: boolean;
    
    /**
     * List of module members.
     */
    members: Base[];
    
    /**
     * True if this module is an external module.
     */
    external: boolean;
  }
  
  /**
   * Interface
   */
  export interface Interface extends Base {
    
    /**
     * True if this module is an ambient module.
     */
    ambient: boolean;
    
    /**
     * Name of the interface.
     */
    name: string;
    
    /**
     * Type parameters for generics.
     */
    typeParameters: TypeParameter[];
    
    /**
     * List of interfaces which this interface extends.
     */
    extends: ObjectTypeRef[];
    
    /**
     * Definition of the interface's members.
     */
    objectType: ObjectType;
    
    /**
     * True if this interface is exported.
     */
    export: boolean;
  }
  
  /**
   * Function
   */
  export interface Function extends Base {
    /**
     * Name of the function.
     */
    name: string;
    
    /**
     * Function signature.
     */
    signature: FunctionType;
    
    /**
     * True if this module is an ambient module.
     */
    ambient: boolean;
  }
  
  /**
   * Defines a function type/signature.
   */
  export interface FunctionType extends Base {
    /**
     * List of parameters for generics.
     */
    typeParameters: TypeParameter[];
    
    /**
     * Return type.
     */
    returnType: PrimaryType;
    
    /**
     * List of parameters
     */
    parameters: Parameter[];
  }
  
  /**
   * Parameter for a function.
   */
  export interface Parameter extends Base {
    /**
     * Name of the parameter.
     */
    name: string;
    
    /**
     * Accessibility / visibility.
     * One of "public", "private", "protected" or null.
     */
    accessibility: string;
    
    /**
     * True if this is a required parameter.
     */
    required: boolean;
    
    /**
     * True if this is a rest parameter.
     */
    rest: boolean;
    
    /**
     * Initialiser string or null if there is none.
     */
    initialiser: string;
    
    /**
     * Parameter type or null if it is missing.
     */
    parameterType: PrimaryType | SpecializedSignature;
  }
  
  /**
   * Type parameter used in generics.
   */
  export interface TypeParameter extends Base {
    /**
     * Parameter name.
     */
    name: string;
    
    /**
     * Primary type it extends, may be null if missing.
     */
    extends: PrimaryType;
  }
  
  /**
   * Specializing type signature.
   * 
   * This is a string literal which appears as the type of a parameter in a
   * function declaration. It acts as a simple pattern to match different
   * overloaded function signatures to different specific values of that
   * parameter.
   */
  export interface SpecializedSignature extends Base {
    /**
     * The string value to match.
     */
    value: string;
  } 

  // -- Types
  /**
   * Base interface for Types
   */
  export interface PrimaryType extends Base {
  }
  
  /**
   * An complex object type.
   */
  export interface ObjectType extends PrimaryType {
    /**
     * Member belonging to this type.
     */
    members: Base[];
  }
  
  /**
   * A reference to a named object type.
   */
  export interface ObjectTypeRef extends PrimaryType {
    /**
     * Name of the type being refered to.
     */
    name: string;
    
    /**
     * Arguments which specialize any generic type parameters.
     */
    typeArguments: PrimaryType[];
  }
  
  /**
   * Tuple type. 
   */
  export interface TupleType extends PrimaryType {
    /**
     * List of member types which compose the tuple.
     */
    members: PrimaryType[];
  }
  
  /**
   * Union type. 
   */
  export interface UnionType extends PrimaryType {
    /**
     * List of member types which compse this union.
     */
    members: PrimaryType[];
  }
  
  /**
   * Represents a typeof query. 
   */
  export interface TypeQuery extends PrimaryType {
    /**
     * Name of the type or variable being queried.
     */
    value: string;
  }
  
  /**
   * Type describing a constructor function.
   */
  export interface ConstructorType extends PrimaryType {
    /**
     * List of parameters for generics.
     */
    typeParameters: TypeParameter[];

    /**
     * Return type.
     */
    returnType: PrimaryType;
    
    /**
     * List of parameters
     */
    parameters: Parameter[];
  }
  
  /**
   * Array type.
   */
  export interface ArrayType extends PrimaryType {
    /**
     * Type of each element in the array.
     */
    member: PrimaryType;
  }
  
  // FIXME add an array type??
  // -- end types.
  
  /**
   * Import declaration.
   */
  export interface ImportDeclaration extends Base {
    /**
     * Local name of the imported module. 
     */
    name: string;
    
    /**
     * Name of the external module.
     */
    externalModule: string;
    
    /**
     * True if this import is also being exported.
     */
    export: boolean;
    
    /**
     * True for imports which rely on an external module.
     */
    external: boolean;
  }
  
  /**
   * Method
   */
  export interface Method extends Base {
    /**
     * Name of the method.
     */
    name: string;
    
    /**
     * True if this method is optional.
     */
    optional: boolean;
    
    /**
     * The method signature.
     */
    signature: FunctionType;
    
    /**
     * True if this method is static.
     */
    static: boolean;
    
    /**
     * Accessibility / visibility.
     * One of "public", "private", "protected" or null.
     */
    accessibility: string;
  }
  
  /**
   * Index method.
   * 
   * An index method is typically of the form:
   *     interface Foo {
   *       [key: number]: string;
   *     }
   */
  export interface IndexMethod extends Base {
    /**
     * The index parameter.
     */
    index: Parameter;
    
    /**
     * The return type of the index method.
     */
    returnType: PrimaryType;
  }
    
  /**
   * Property
   */
  export interface Property extends Base {
    /**
     * Name of the property.
     */
    name: string;
    
    /**
     * True if this method is optional.
     */
    optional: boolean;
    
    /**
     * The method signature.
     */
    signature: FunctionType | PrimaryType;
    
    /**
     * True if this method is static.
     */
    static: boolean;
    
    /**
     * Accessibility / visibility.
     * One of "public", "private", "protected" or null.
     */
    accessibility: string;
  }
  
  /**
   * Type alias
   */
  export interface TypeAlias extends Base {   
    /**
     * True if this type alias is an ambient.
     */
    ambient: boolean;
    
    /**
     * Name of the type alias.
     */
    name: string;
    
    /**
     * The type this type alias represents.
     */
    entity: ObjectType | ObjectTypeRef;
  }
  
  /**
   * Export assignment.
   * 
   * This is typically:
   *     export = FooBar;
   */
  export interface ExportAssignment extends Base {
    /**
     * Name of the value being exported.
     */
    name: string;
  }
  
  /**
   * Variable
   */
  export interface Variable extends Base {
    /**
     * Name of the variable.
     */
    name: string;

    /**
     * The variable's type.
     * 
     * This may be null. 
     */    
    signature: FunctionType | PrimaryType;
  }
  
  /**
   * Class
   */
  export interface Class extends Base {
    /**
     * True if this class is ambient.
     */
    ambient: boolean;
    
    /**
     * Name of the class.
     */
    name: string;
    
    /**
     * Type parameters for generics.
     */
    typeParameters: TypeParameter[];
    
    /**
     * Object type this class extends.
     * 
     * This may be null.
     */
    extends: ObjectTypeRef;

    /**
     * Definition of the class' members.
     */
    objectType: ObjectType;
    
    /**
     * List of types this class implements.
     */
    implements: ObjectTypeRef[];
  }
  
  /**
   * Enum 
   */
  export interface Enum extends Base {
    /**
     * True if this class is ambient.
     */
    ambient: boolean;
    
    /**
     * True if this is constant enum.
     */
    constant: boolean;

    /**
     * True if this enum is exported.
     */
    export: boolean;
    
    /**
     * The list of enum members.
     */
    members: EnumMember[];
    
    /**
     * Name of the enum.
     */
    name: string;
  }
  
  /**
   * Enum member 
   */
  export interface EnumMember extends Base {
    /**
     * Name of this member.
     */
    name: string;
    
    /**
     * Enum value.
     * 
     * This may be null. Numeric values are just represented as strings.
     */
    value: string;
  }
}

/**
 * Parse a TypeScript definition file.
 *
 * @param text TypeScript definition text.
 * @return List of objects found in the given text.
 */
export function parse(text: string): Defs.Base[] {
  return typescript_definition.parse(text);
}

/**
 * Format a Base object or objects into a string.
 * 
 * This is basically the reverse of parse(). It takes the parsed structure
 * formats it into a string.
 *    
 * @return formatted string.
 */
export function toString(objOrList: Defs.Base | Defs.Base[], level: number=0, indent: string = "    "): string {
  
  if (Array.isArray(objOrList)) {
    return listToString( <Defs.Base[]> objOrList);
  }
  
  let obj = <Defs.Base> objOrList;
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
        
      case Defs.Type.ARRAY_TYPE:
        let arrayType = <Defs.ArrayType> obj;
        return toString(arrayType.member) + "[]";
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
        result += method.accessibility !== null ? method.accessibility + " " : "";
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
        result += prop.accessibility !== null ? prop.accessibility + " " : "";
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
        let ambientVariable = <Defs.Variable> obj;
        return dent + "declare var " + ambientVariable.name +
          (ambientVariable.signature === null ? "" : ": " + toStringFunctionSignature(ambientVariable.signature)) +  ";\n";
        break;
        
      case Defs.Type.CLASS:
        let classDec = <Defs.Class> obj;
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
        result += " {\n" + listToString(classDec.objectType.members, level+1, indent) + "}\n";
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

function listToString(obj: Defs.Base[], level: number=0, indent: string = "    "): string {
  if (obj === null) {
    return "";
  }
  return obj.map( (item) => toString(item, level, indent) ).join("");
}

function toStringFunctionSignature(obj: Defs.Base, level: number=0,
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

