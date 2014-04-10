/*jslint node:true, indent:2, regexp:true */
"use strict";

function getExtension(filename) {
  var splitFilename = filename.split("."),
    extIndex = splitFilename.length - 1,
    ext = splitFilename[extIndex];

  return ext.toLowerCase();
}

function getInfoFromFilename(filename) {
  var re = /(.*)S\d{1,2}E\d{1,2}.*/,
    searchResults = filename.match(re),
    show,
    episodeObject = {};

  show = searchResults[1];
  show = show.trim();

  episodeObject.show = show;
  return episodeObject;
}

// exports for tests...
exports.getExtension = getExtension;
exports.getInfoFromFilename = getInfoFromFilename;
