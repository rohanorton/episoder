/*jslint node:true, indent:2, regexp:true */
"use strict";

// polyfill for Array.prototype.findIndex (available in ES6)
require('array.prototype.findindex');

var  traktApiKey,
  http = require("http");

try {
  traktApiKey = require("../config/traktApiKey.js");
} catch (e) {
  console.log("ERROR: Cannot find trakt api config file");
  console.log("Please get an api key from http://trakt.tv/api-docs/authentication");
  console.log("Save it using the --save_api_key flag.");
  console.log();
  console.log("Example:");
  console.log("    episoder --save_api_key 'trakt-api-key-goes-here'");
  console.log();
  process.exit(1);
}

function getEpisodeIndex(traktResultsArray, episodeNumber) {
  try {
    return traktResultsArray.findIndex(function (x) {
      return x.episode === episodeNumber;
    });
  } catch (e) {
    return -1;
  }
}

function getTitle(episodeObject, callback) {
  var show = episodeObject.show,
    season = episodeObject.season,
    episode = episodeObject.episode,
    path,
    host,
    options;

  if (show === undefined || season === undefined || episode === undefined) {
    return callback(new Error("Not enough episode data to make trakt query!"));
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
        index = getEpisodeIndex(episodeArray, episode);

      if (index === -1) {
        return callback(new Error("Unable to find episode in trakt database"));
      }

      episodeObject.title = episodeArray[index].title;

      return callback(null, episodeObject);
    });
    res.on("error", function () {
      return callback(new Error("There was a problem connecting to trakt database"));
    });
  });
}

exports.getTitle = getTitle;
exports.getEpisodeIndex = getEpisodeIndex;
