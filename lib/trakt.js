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

exports.getTitle = getTitle;
