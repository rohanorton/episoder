/*jslint node:true, indent:2 */
"use strict";

function getExtension(filename) {
  var splitFilename = filename.split("."),
    extIndex = splitFilename.length - 1,
    ext = splitFilename[extIndex];
  return ext;
}


// exports for tests...
exports.getExtension = getExtension;
