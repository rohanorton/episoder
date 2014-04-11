/*jslint node:true, indent:2, regexp:true */
"use strict";

var  traktApiKey,
  http = require("http");

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

function getEpisodeIndex(traktResultsArray, episodeNumber) {
  // This function presupposes that trakt array is in order.
  // I have no reason to believe otherwise.
  var i = episodeNumber - 1,
    iterations = 3,
    difference;

  while (iterations > 0) {
    if (traktResultsArray[i].episode === episodeNumber) {
      return i;
    }

    if (traktResultsArray[i].episode !== episodeNumber) {
      difference = episodeNumber - traktResultsArray[i].episode;
      i += difference;
    }
    iterations -= 1;
  }
  return null;
}

function getTitle(episodeObject, callback) {
  var show = episodeObject.show,
    season = episodeObject.season,
    episode = episodeObject.episode,
    path,
    host,
    options;

  if (show === undefined || season === undefined || episode === undefined) {
    callback("Not enough episode data to make trakt query!");
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
        episodeTitle,
        index;

      try {
        index = getEpisodeIndex(episodeArray, episode);
        episodeTitle = episodeArray[index].title;
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

exports.getTitle = getTitle;
exports.getEpisodeIndex = getEpisodeIndex;
