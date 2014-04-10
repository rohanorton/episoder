/*jslint node:true, indent:2 */
"use strict";

function getExtension(filename) {
  var ext = filename.split(".")[1];
  return ext;
}


// exports for tests...
exports.getExtension = getExtension;
