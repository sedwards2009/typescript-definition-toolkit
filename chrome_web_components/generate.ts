//  Copyright 2015 Simon Edwards <simon@simonzone.com>
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//  

// Takes a standard TS lib, converts HTMLElement from an interface to a
// class for use when doing web component development.

import * as SourceMapSupport from 'source-map-support';
import * as toolkit from '../TypeScriptDefinitionToolkit';
import * as fs from 'fs';

SourceMapSupport.install();

// The file we want to mangle.
const fileName = "../node_modules/typescript/bin/lib.es6.d.ts";

// Extra stuff which is appended to the input file before it is parsed and processed.
const extraFileName = "chrome_extra_lib.d.ts";

// Extra stuff which is appended to the output file.
const postChromeFileName = "chrome_post_lib.d.ts";

// Output file name
const chromeFileName = "chrome_lib.es6.d.ts";

//-------------------------------------------------------------------------
const log = console.log.bind(console);

const EXTRA_DELETE_VARIABLES: string[] = [
  "CustomEvent" // Replaced in chrome_post_lib.d.ts.
];

function main(): void {
  
  log("Reading " + fileName);
  const sourceText = fs.readFileSync(fileName, "UTF-8");

  log("Reading " + extraFileName);
  const extraSourceText = fs.readFileSync(extraFileName, "UTF-8");

  log("Parsing");
  const tree = toolkit.parse(sourceText + extraSourceText);
  
  // toolkit.
  log("Scanning for HTMLElement subinterfaces");
  const subinterfaces = toolkit.findAllSubinterfacesInScope([tree], "HTMLElement");
  
  // log("Subinterfaces:");
  // subinterfaces.forEach( (item) => console.log(toolkititem) );

  const htmlElementInterface = toolkit.findInterface(tree, "HTMLElement");

  const classList = [...htmlElementInterface, ...subinterfaces];
  
  log("");
  const forceClassNames = classList.map(toolkit.scopedItemToPath);
  log("forceClassNames:", forceClassNames);
  
  classList.forEach( (value) => {
    log("Transforming " + toolkit.scopedItemToPath(value));
    transformInterfaceToClass(value, forceClassNames);
  } );

  classList.forEach( (value) => {
    log("Expanding implemented interface methods in " + toolkit.scopedItemToPath(value));
    const scopedClass =  <any> value;
    expandClassImplements(scopedClass);
  });

  log("Deleting unneeded variables");
  
  const deleteVariableNames = [...EXTRA_DELETE_VARIABLES, ...forceClassNames];
  
  deleteVariableNames.forEach( (variableName) => {
    const scopedVariables = toolkit.findVariable(tree, variableName);
    log(`Deleting ${scopedVariables.length} of variable '${variableName}'`);
    scopedVariables.forEach(deleteScopedItem);
  });
    
  log("Writing output");
  var postSourceText = fs.readFileSync(postChromeFileName, "UTF-8");
  
  const output = toolkit.toString(tree);
  fs.writeFileSync(chromeFileName, "// Generated at " + (new Date()) + "\r\n" + output + postSourceText);
  log("Done");

}

function transformInterfaceToClass(target: toolkit.ScopedInterface, forcedClasses: string[]): void {
  const sourceObject = <toolkit.Defs.Interface> target.item;
  
  const resolvedExtends = sourceObject.extends.map( typeRef => {
    let resolvedRefs: toolkit.ScopedItem[] = toolkit.findInterface(target.scopes[0], typeRef.name);

    if (resolvedRefs.length === 0) {
      resolvedRefs = toolkit.findClass(target.scopes[0], typeRef.name);
    }

    if (resolvedRefs.length !== 0) {
      return toolkit.scopedItemToPath(resolvedRefs[0]);
    } else {
      log("Counldn't find ",typeRef.name);
      return null;
    }
  } );

  log("resolvedExtends:",resolvedExtends);

  const extendsList = resolvedExtends.filter( fullName => forcedClasses.indexOf(fullName) !== -1);
  const implementsList = resolvedExtends.filter( fullName => forcedClasses.indexOf(fullName) === -1);
  const extendsRef = extendsList.length === 0 ? null : toObjectRef(extendsList[0]);
  const implementsRefs = implementsList.map(toObjectRef);
  log("implementsRefs: ",implementsRefs);
  const targetObject: toolkit.Defs.Class = {
    type: toolkit.Defs.Type.CLASS,
    ambient: true,
    objectType: sourceObject.objectType,
    name: sourceObject.name,
    typeParameters: sourceObject.typeParameters,
    extends: extendsRef,
    implements: implementsRefs
  };
  
  // Clean the source object.
  for (let p in sourceObject) {
    delete sourceObject[p];
  }
  
  // Copy the properties of the target object over the source object. i.e. in place.
  for (let p in targetObject) {
    sourceObject[p] = targetObject[p];
  }
}

function toObjectRef(name: string): toolkit.Defs.ObjectTypeRef {
  return {
    type: toolkit.Defs.Type.OBJECT_TYPE_REF,
    name: name,
    typeArguments: []
  };
}

function deleteScopedItem(scopedItem: toolkit.ScopedItem): void {
  const lastScope = scopedItem.scopes[scopedItem.scopes.length-1];
  let memberList: toolkit.Defs.Base[] = null;
  
  if (Array.isArray(lastScope)) {
    memberList = <toolkit.Defs.Base[]> lastScope;
    
  } else {
    const baseScope =<toolkit.Defs.Base> lastScope;
    switch (baseScope.type) {
      
      case toolkit.Defs.Type.MODULE:
        const moduleDef = <toolkit.Defs.Module> baseScope;
        memberList = moduleDef.members;
        break;
        
      case toolkit.Defs.Type.INTERFACE:
        const interfaceDef = <toolkit.Defs.Interface> baseScope;
        memberList = interfaceDef.objectType.members;
        break;
        
      case toolkit.Defs.Type.CLASS:
        const classDefs = <toolkit.Defs.Class> baseScope;
        memberList = classDefs.objectType.members;
        break;
        
      default:
        return;
    }
  }
  memberList.splice(memberList.indexOf(scopedItem.item), 1);
}

function expandClassImplements(scopedClass: toolkit.ScopedClass): void {
  scopedClass.item.implements.forEach( (iface) => {
    expandInterfaceIntoClass(scopedClass, iface.name);
  });
}

function expandInterfaceIntoClass(scopedClass: toolkit.ScopedClass, interfaceName: string): void {
  const flatInterface = toolkit.flattenInterface(interfaceName, scopedClass.scopes);
  const classDef = scopedClass.item;
  classDef.objectType.members.push(...flatInterface.objectType.members);
}

main();
