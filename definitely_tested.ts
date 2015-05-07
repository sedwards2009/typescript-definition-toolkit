"use strict";

import fs = require('fs');
import path = require('path');
import glob = require('glob');

import toolkit = require("./TypeScriptDefinitionToolkit");

const DEFINITELY_TYPED_PATH = "../DefinitelyTyped/";

function main() {
  let count = 0;

  glob.sync(DEFINITELY_TYPED_PATH + "**/*.d.ts").forEach( (item) => {
    const dFilePath = item;
    if (fs.existsSync(dFilePath)) {
      log("" + count + " " + dFilePath);
      count++;
      const text = fs.readFileSync(dFilePath, 'utf8');
      try {
        toolkit.parse(text);
      } catch(ex) {
        console.log(ex.message);
        console.log(ex.stack);
        process.exit(1);
      }
    }
  });
}

function log(text: string): void {
  console.log(text);
}

main();
