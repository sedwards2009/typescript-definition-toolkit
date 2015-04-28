/// <reference path="./typings/tsd.d.ts" />
/// <reference path="./typescript_definition.d.ts" />

"use strict";

import fs = require('fs');
import path = require('path');
import toolkit = require("./TypeScriptDefinitionToolkit");

const DEFINITELY_TYPED_PATH = "../DefinitelyTyped/";

function main() {
  
  fs.readdirSync(DEFINITELY_TYPED_PATH).forEach( (item) => {
    const dFilePath = path.join(path.join(DEFINITELY_TYPED_PATH, item), item + ".d.ts");
    if (fs.existsSync(dFilePath)) {
      log(dFilePath);
      const text = fs.readFileSync(dFilePath, 'utf8');
      try {
      toolkit.parse(text);
    } catch(ex) {
      console.log(ex);
      process.exit(1);
    }
    }
  });
  
  
}

function log(text: string): void {
  console.log(text);
}

main();
