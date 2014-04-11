#!/usr/bin/env node
/*jslint node:true, stupid:true, indent:2, regexp:true */
"use strict";

var trakt = require("./trakt.js"),
  fs = require("fs"),
  glob = require("glob"),
  Promise = require("bluebird"),
  titleCase = require("to-title-case");


function zPad(num) {
  return (+num < 10 ? "0" : "") + num;
}

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function getExtension(filename) {
  var splitFilename = filename.split("."),
    extIndex = splitFilename.length - 1,
    ext = splitFilename[extIndex];

  return ext.toLowerCase();
}

function promiseWhile(condition, action) {
  // I stole this function from Victor Quinn
  // https://gist.github.com/victorquinn/8030190
  // I really have to learn more about promises.
  var resolver = Promise.defer(),
    loop = function () {
      if (!condition()) {
        return resolver.resolve();
      }
      return Promise.cast(action())
        .then(loop)
        .catch(resolver.reject);
    };
  process.nextTick(loop);
  return resolver.promise;
}

function parseFilename(filename) {
  // this regex should match:
  //   Community S01E04.mp4
  //   Community s01e04.mp4
  //   Community 1x04.mp4
  var re = /(.*)\D(\d{1,2})[ex](\d{1,2})/i,
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
    re = /(.*)\D(\d)(\d\d)\D/;
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


function getReplacementFilename(filename, callback) {
  var episodeObject = parseFilename(filename);

  trakt.getTitle(episodeObject, function (err, episodeObject) {
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
  var a = src.split("/"),
    filename = a.pop(),
    dir = a.join("/");

  if (dir.length > 0) {
    dir += "/";
  }

  getReplacementFilename(filename, function (err, replacementFilename) {
    if (err) {
      console.log("ERROR:", err);
      return;
    }

    var dest = dir + replacementFilename;

    console.log("renaming", src, "to", dest);
    fs.rename(src, dest);
    callback();
  });
}

function main(args, callback) {
  var globOptions = { mark: true }, // mark puts '/' at end of directories
    i = 0;
  glob(args, globOptions, function (err, files) {
    if (err) {
      console.log(err);
      return;
    }
    promiseWhile(function () {
      return i < files.length;
    }, function () {
      return new Promise(function (resolve) {
        if (!endsWith(files[i], "/")) {
          renameEpisodeFile(files[i], function () {
            i += 1;
            resolve();
          });
        }
      });
    }).then(function () {
      callback();
    });
  });
}

if (require.main === module) {
  main();
}
// exports for tests...
exports.zPad = zPad;
exports.getExtension = getExtension;
exports.parseFilename = parseFilename;
exports.getReplacementFilename = getReplacementFilename;
exports.renameEpisodeFile = renameEpisodeFile;
exports.main = main;
