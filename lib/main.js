/*jslint node:true, indent:2, regexp:true */
"use strict";
var titleCase = require("to-title-case");

function getExtension(filename) {
  var splitFilename = filename.split("."),
    extIndex = splitFilename.length - 1,
    ext = splitFilename[extIndex];

  return ext.toLowerCase();
}

function getInfoFromFilename(filename) {
  // this regex should match:
  //   Community S01E04.mp4
  //   Community s01e04.mp4
  //   Community 1x04.mp4
  var re = /(.*)\D(\d{1,2})[ex](\d{1,2}).*/i,
    searchResults = filename.match(re),
    show,
    season,
    episode,
    episodeObject = {};

  if (searchResults === null) {
    // should match:
    //   Community 104.mp4
    re = /(.*)\D(\d)(\d\d)\D.*/;
    searchResults = filename.match(re);
  }

  show = searchResults[1];
  show = titleCase(show.trim());

  season = Number(searchResults[2]);
  episode = Number(searchResults[3]);

  episodeObject = {
    show: show,
    season: season,
    episode: episode
  };
  return episodeObject;
}

// exports for tests...
exports.getExtension = getExtension;
exports.getInfoFromFilename = getInfoFromFilename;
