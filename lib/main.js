/*jslint node:true, indent:2, regexp:true */
"use strict";
var  traktApiKey,
  fs = require("fs"),
  http = require("http"),
  titleCase = require("to-title-case");

// Ensure that we have a trakt api key before progressing
try {
  traktApiKey = require("../config/traktApiKey.js");
} catch (e) {
  console.log("ERROR: A config file is required");
  console.log("Please get yourself an api key from http://trakt.tv/api-docs/authentication");
  console.log("and create a config/traktApiKey.js file containing the following line:");
  console.log();
  console.log("module.exports = 'YOUR-API-KEY-GOES-HERE';");
  process.exit();
}

function zPad(num) {
  return (+num < 10 ? "0" : "") + num;
}

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
    ext = getExtension(filename),
    show,
    season,
    episode,
    episodeObject = {};

  if (searchResults === null) {
    // this regex should match:
    //   Community Season 1 Episode 4.mp4
    // (case insensitive)
    re = /(.*)Season.*(\d{1,2}).*Episode.*(\d{1,2})/i;
    searchResults = filename.match(re);
  }

  if (searchResults === null) {
    // this regex should match:
    //   Community 104.mp4
    re = /(.*)\D(\d)(\d\d)\D.*/;
    searchResults = filename.match(re);
  }

  show = searchResults[1];
  show = titleCase(show.trim());

  season = Number(searchResults[2]);
  episode = Number(searchResults[3]);

  episodeObject = {
    originalFilename: filename,
    show: show,
    season: season,
    episode: episode,
    extension: ext
  };
  return episodeObject;
}

function getTitle(episodeObject, callback) {
  var show = episodeObject.show,
    season = episodeObject.season,
    episode = episodeObject.episode,
    path,
    host,
    options;

  if (show === undefined || season === undefined || episode === undefined) {
    callback("Not enough episode data to make trakt query.");
    return;
  }

  show = show.split(" ").join("-");

  path = "/show/season.json/" + traktApiKey + "/" + show + "/" + season;
  host = "api.trakt.tv";
  options = {
    host: host,
    path: path
  };

  http.get(options, function (res) {
    var data = "";
    res.on("data", function (chunk) {
      data += String(chunk);
    });
    res.on("end", function () {
      var episodeArray = JSON.parse(data),
        episodeTitle;
      try {
        episodeTitle = episodeArray[episode - 1].title;
      } catch (err) {
        callback(err);
        return;
      }
      episodeObject.title = episodeTitle;
      callback(null, episodeObject);
    });
    res.on("error", function (err) {
      callback(err);
    });
  });
}

function getReplacementFilename(filename, callback) {
  var episodeObject = getInfoFromFilename(filename);

  getTitle(episodeObject, function (err, episodeObject) {
    if (err) {
      callback(err);
      return;
    }
    var show = episodeObject.show,
      season = zPad(episodeObject.season),
      episode = zPad(episodeObject.episode),
      title = episodeObject.title,
      ext = episodeObject.extension,
      replacementFilename = show + " - " + "S" + season + "E" + episode + " - " + title +  "." + ext;

    callback(null, replacementFilename);
  });
}

function renameEpisodeFile(src, callback) {
  getReplacementFilename(src, function (err, dest) {
    if (err) {
      console.log("ERROR:", err);
      return;
    }
    console.log("renaming", src, "to", dest);
    fs.rename(src, dest);
    callback();
  });
}


// exports for tests...
exports.zPad = zPad;
exports.getExtension = getExtension;
exports.getInfoFromFilename = getInfoFromFilename;
exports.getTitle = getTitle;
exports.getReplacementFilename = getReplacementFilename;
exports.renameEpisodeFile = renameEpisodeFile;
