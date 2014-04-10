/*jslint node:true, indent:2, regexp:true */
"use strict";
var traktApiKey = require("../config/traktApiKey.js"),
  http = require("http"),
  titleCase = require("to-title-case");

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
    show: show,
    season: season,
    episode: episode
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

// exports for tests...
exports.getExtension = getExtension;
exports.getInfoFromFilename = getInfoFromFilename;
exports.getTitle = getTitle;
