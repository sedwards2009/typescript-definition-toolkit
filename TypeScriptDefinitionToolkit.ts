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

import _ = require("lodash");
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
     * The constructor signature.
     */
    signature: FunctionType;
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
        let constructorType = <Defs.ConstructorType> obj;

        result = "new";
        if (constructorType.signature.typeParameters !== null && constructorType.signature.typeParameters.length !==0) {
          result += "<";
          result += constructorType.signature.typeParameters.map( (p) => toString(p) ).join(", ");
          result += ">";
        }
        
        result += "(";
        result += constructorType.signature.parameters.map( (p) => toString(p, level, indent) ).join(", ");
        result += ")";
        result += (constructorType.signature.returnType !== null ? (" => "+ toString(constructorType.signature.returnType)) : "");
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

export type Scope = Defs.Base | Defs.Base[];

export interface ScopedItem {
  item: Defs.Base;
  scopes: Scope[];
}

export interface ScopedInterface {
  item: Defs.Interface;
  scopes: Scope[];
}

/**
 * Find all interface declarations by path.
 * 
 * @param scope list of Defs.Bases to scan through.
 * @param interfaceName Path to the desired interface. This is a dotted
 *     path which may traverse modules, interfaces and classes.
 * @return List of matches.
 */
export function findInterface(scope: Scope, interfaceName: string): ScopedInterface[] {
  return <ScopedInterface[]> searchByPath(getScopeMembers(scope), interfaceName).filter(
    inter => inter.item.type === Defs.Type.INTERFACE );
}

export interface ScopedClass {
  item: Defs.Class;
  scopes: Scope[];
}

/**
 * Find all class declarations by path.
 * 
 * @param scope list of Defs.Bases to scan through.
 * @param className Path to the desired class. This is a dotted
 *     path which may traverse modules, interfaces and classes.
 * @return List of matches.
 */
export function findClass(scope: Scope, className: string): ScopedClass[] {
  return <ScopedClass[]> searchByPath(getScopeMembers(scope), className).filter(
    clazz => clazz.item.type === Defs.Type.CLASS );
}

function getScopeMembers(scope: Scope): Defs.Base[] {
  if (Array.isArray(scope)) {
    return <Defs.Base[]> scope;
  } else {
    const obj = <Defs.Base> scope;
    switch(obj.type) {
      
      case Defs.Type.INTERFACE:
        return (<Defs.Interface> obj).objectType.members;
        
      case Defs.Type.CLASS:
        return (<Defs.Class> obj).objectType.members;
        
      case Defs.Type.MODULE:
        return (<Defs.Module> obj).members;
      
      default:
        return [];
    }
  }
}

function searchByPath(scope: Scope, path: string): ScopedItem[] {
  let parts = path.split(/\./g);
  return searchByPathList(scope, parts);
}

/**
 * Find objects by path.
 *
 * @param scope the scope to scan down through
 * @param pathList list of path names to match on.
 * @return List of matches.
 */
function searchByPathList(scope: Scope, pathList: string[]): ScopedItem[] {
  const first = pathList[0];
  const found: ScopedItem[] = getScopeMembers(scope).filter( item => {
    switch(item.type) {
      case Defs.Type.MODULE:
        return (<Defs.Module> item).name === first;
        break;
        
      case Defs.Type.INTERFACE:
        return (<Defs.Interface> item).name === first;
        break;
        
      case Defs.Type.CLASS:
        return (<Defs.Class> item).name === first;
        break;
        
      default:
        return false;
    }
  }).map( x => ( { item: x, scopes: [scope]} ) );

  if (pathList.length <= 1) {
    return found;
  } else {
    const rest = pathList.slice(1);
    return found.map( match => {
        switch(match.item.type) {
          case Defs.Type.MODULE:
          case Defs.Type.INTERFACE:
          case Defs.Type.CLASS:
            return searchByPathList(match.item, rest);
            break;
            
          default:
            return [];
        }
      })
      .reduce( (prev, current) => prev.concat(current), [])
      .map( x => ( {item: x.item, scopes: (<Scope[]> [scope]).concat(x.scopes) } ) );
  }
}

/**
 * Resolve an identifier in the context of a list of scopes.
 * 
 * @param identifier Dotted identifier name to resolve.
 * @param scopes List of scopes to search through. The top level scopes
 *   should be first in the list with smaller nested scopes following it.
 * @return List of matches.
 */
export function resolveIdentifier(identifier: string, scopes: Scope[]): ScopedItem[] {
  const result: Defs.Base[] = [];
  let i = scopes.length-1;
  
  while (i>=0) {
    const scope = scopes[i];
    const matches = searchByPath(scope, identifier);
    if (matches.length !== 0) {
      return matches.map( m => ( {item: m.item, scopes: scopes.slice(0,i).concat(m.scopes) } ) );
    }
    i--;
  }
  return [];
}

/**
 * Flatten an interface and superinterfaces into one independent interface declaration.
 * 
 * This does not modify the source data structure.
 * 
 * @param identifier Dotted identifier name to resolve.
 * @param scopes List of scopes to search through. The top level scopes
 *   should be first in the list with smaller nested scopes following it.
 * @return The flattened interface declaration. 
 */
export function flattenInterface(identifier: string, scopes: Scope[]): Defs.Interface {
  const interfaceMatches = resolveIdentifier(identifier, scopes);
  let result: Defs.Interface = null;
  
  const pathParts = identifier.split(/\./g);
  const name = pathParts[pathParts.length-1];
  const body: Defs.ObjectType = { type: Defs.Type.OBJECT_TYPE, members: [] };
  
  result = {type: Defs.Type.INTERFACE, ambient: true, name: name, typeParameters: [], extends: [],
    export: false, objectType: body };
    
  // Concatinate the members of each matched interface making sure to expand an type references to fully qualified references
  interfaceMatches.forEach( inter => {
    const interfaceCopy = _.cloneDeep(inter.item);
    expandTypeReferencesInPlace(interfaceCopy, inter.scopes);
    body.members = body.members.concat( (<Defs.Interface> interfaceCopy).objectType.members);
  });

  // Merge in each super interface.
  interfaceMatches.forEach( match => {
    const inter = <Defs.Interface> match.item;
    inter.extends.forEach( extendsItem => {
      const flatExtends = flattenInterface(extendsItem.name, match.scopes);
      const members = flatExtends.objectType.members;
      
      const comment: Defs.WhiteSpace = { type: Defs.Type.WHITESPACE,value: "// " + extendsItem.name + "\n"};
      body.members.push(comment);
      
      body.members = body.members.concat(members);
    });

  });

  return result;
}

export function expandTypeReferences(obj: Defs.Base, scopes: Scope[]): Defs.Base {
  const copy: Defs.Base = _.cloneDeep(obj);
  return expandTypeReferencesInPlace(copy, scopes);
}

function expandTypeReferencesInPlace(obj: Defs.Base, scopes: Scope[]): Defs.Base {
  switch (obj.type) {
    
    case Defs.Type.MODULE:
      const mod = <Defs.Module> obj;
      mod.members = mod.members.map( m => expandTypeReferencesInPlace(m, scopes) );
      return mod;

    case Defs.Type.INTERFACE:
      const inter: Defs.Interface = <Defs.Interface> obj;
      inter.extends = inter.extends.map( item => <Defs.ObjectTypeRef> expandTypeReferencesInPlace(item, scopes) );
      inter.objectType = <Defs.ObjectType> expandTypeReferencesInPlace(inter.objectType, scopes.concat( [inter] ) );
      return inter;

    case Defs.Type.CLASS:
      const class_ = <Defs.Class> obj;
      class_.extends = <Defs.ObjectTypeRef> expandTypeReferencesInPlace(class_.extends, scopes);
      class_.objectType = <Defs.ObjectType> expandTypeReferencesInPlace(class_.objectType, scopes.concat( [class_] ) );
      return class_;
        
    case Defs.Type.OBJECT_TYPE_REF:
      const objectTypeRef = <Defs.ObjectTypeRef> obj;
      const resolved = resolveIdentifier(objectTypeRef.name, scopes);
      if (resolved.length === 0) {
        return obj;
      }
      const path = scopesToPath(resolved[0].scopes);
      objectTypeRef.name = (path === "" ? "" : path + ".") + objectTypeRef.name;
      return objectTypeRef;
    
    case Defs.Type.OBJECT_TYPE:
      const objectType = <Defs.ObjectType> obj;
      objectType.members = objectType.members.map( m => expandTypeReferencesInPlace(m, scopes) );
      return objectType;
      
    case Defs.Type.METHOD:
      const method = <Defs.Method> obj;
      method.signature = <Defs.FunctionType> expandTypeReferencesInPlace(method.signature, scopes);
      return method;
      
    case Defs.Type.PARAMETER:
      const param = <Defs.Parameter> obj;
      param.parameterType = expandTypeReferencesInPlace(param.parameterType, scopes);
      return param;
      
    case Defs.Type.PROPERTY:
      const prop = <Defs.Property> obj;
      prop.signature = expandTypeReferencesInPlace(prop.signature, scopes);
      return prop;
      
    case Defs.Type.INDEX_METHOD:
      const indexMethod = <Defs.IndexMethod> obj;
      indexMethod.returnType = expandTypeReferencesInPlace(indexMethod.returnType, scopes);
      return indexMethod;
      
    case Defs.Type.FUNCTION:
      const function_ = <Defs.Function> obj;
      function_.signature = <Defs.FunctionType> expandTypeReferencesInPlace(function_.signature, scopes);
      return function_;
        
    case Defs.Type.FUNCTION_TYPE:
      const functionType = <Defs.FunctionType> obj;
      functionType.parameters = <Defs.Parameter[]> functionType.parameters.map( p => expandTypeReferencesInPlace(p, scopes) );
      functionType.returnType = expandTypeReferencesInPlace(functionType.returnType, scopes);
      return functionType;
      
    case Defs.Type.TUPLE_TYPE:
      const tupleType = <Defs.TupleType> obj;
      tupleType.members = tupleType.members.map( m => expandTypeReferencesInPlace(m, scopes) );
      return tupleType;
      
    case Defs.Type.UNION_TYPE:
      const unionType = <Defs.TupleType> obj;
      unionType.members = unionType.members.map( m => expandTypeReferencesInPlace(m, scopes) );
      return unionType;
      
    case Defs.Type.ARRAY_TYPE:
      const arrayType = <Defs.ArrayType> obj;
      arrayType.member = expandTypeReferencesInPlace(arrayType.member, scopes);
      return arrayType;
      
    case Defs.Type.TYPE_ALIAS:
      const typeAlias = <Defs.TypeAlias> obj;
      typeAlias.entity = <Defs.ObjectType | Defs.ObjectTypeRef> expandTypeReferencesInPlace(typeAlias.entity, scopes);
      return typeAlias;
    
    case Defs.Type.AMBIENT_VARIABLE:
      const ambientVariable = <Defs.Variable> obj;
      ambientVariable.signature = expandTypeReferencesInPlace(ambientVariable.signature, scopes);
      return ambientVariable;
      
    case Defs.Type.CONSTRUCTOR_TYPE:
      const constructorType = <Defs.ConstructorType> obj;
      constructorType.signature = <Defs.FunctionType> expandTypeReferencesInPlace(constructorType.signature, scopes);
      return constructorType;
      
    default:
      break;
  }
  
  return obj;
}

function scopesToPath(scopes: Scope[]): string {
  const objectScopes = <Defs.Base[]> scopes.filter( (s) => ! Array.isArray(s) );
  return objectScopes.map( s => {
    switch(s.type) {
      case Defs.Type.MODULE:
        return (<Defs.Module>s).name;
      case Defs.Type.CLASS:
        return (<Defs.Class>s).name;
      case Defs.Type.INTERFACE:
        return (<Defs.Interface>s).name;
      default:
        return "";
    }
  } ).join(".");
}
