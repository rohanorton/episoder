#!/usr/bin/env node
/*jslint node:true, indent:2, regexp:true, nomen:true */
"use strict";

var argv = require("yargs").argv,
  trakt = require("./trakt.js"),
  fs = require("fs"),
  glob = require("glob"),
  async = require("async"),
  titleCase = require("to-title-case"),
  errCouldNotRename = "unable to rename ",
  optionalParams = require("./helpers.js").optionalParams,
  zPad = require("./helpers.js").zPad,
  i;

function getExtension(filename) {
  var splitFilename = filename.split("."),
    extIndex = splitFilename.length - 1,
    ext = splitFilename[extIndex];

  return ext.toLowerCase();
}

function parseFilename(filename, options) {
  // options is optional
  // but no need to use optionalParams() as there's no callback :)

  // this regex should match:
  //   Community S01E04.mp4
  //   Community s01e04.mp4
  //   Community 1x04.mp4
  //   Community 1-04.mp4
  var re = /(.*)\D(\d{1,2})[ex\-](\d{1,2})/i,
    searchResults = filename.match(re),
    ext = getExtension(filename),
    show,
    season,
    episode,
    offset,
    episodeObject = {};

  if (options === undefined) {
    options = {};
  }
  offset = options.offset || 0;
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

  try {
    show = options.show || searchResults[1];
  } catch (e) {
    return null;
  }
  show = titleCase(show
      // remove hanging characters
      .replace(/^[\-.\s]+|[\-.\s]+$/g, "")
      .trim());

  season = Number(searchResults[2]);
  episode = Number(searchResults[3]) + offset;

  episodeObject = {
    originalFilename: filename,
    show: show,
    season: season,
    episode: episode,
    extension: ext
  };
  return episodeObject;
}

function getReplacementFilename(filename, options, callback) {
  // options is optional
  var args = optionalParams(filename, options, callback),
    episodeObject;
  filename = args.input;
  options = args.optional;
  callback = args.callback;
  episodeObject = parseFilename(filename, options);

  if (episodeObject === null) {
    return callback(errCouldNotRename + filename);
  }

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

function renameEpisodeFile(src, options, callback) {
  // options is optional
  var args = optionalParams(src, options, callback),
    filename,
    dir,
    a;
  src = args.input;
  options = args.optional;
  callback = args.callback;

  a = src.split("/");
  filename = a.pop();
  dir = a.join("/");

  if (dir.length > 0) {
    dir += "/";
  }

  getReplacementFilename(filename, options, function (err, replacementFilename) {
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
  var globOptions = {
    mark: true // puts '/' at end of directories
  };

  // args._ is where optimist puts all arguments not
  // associated with flags
  async.each(args._, function (files) {
    glob(files, globOptions, function (err, filenames) {
      if (err) {
        return callback(err);
      }
      if (filenames.length > 0) {
        async.each(filenames, function (file, callback) {
          renameEpisodeFile(file, args, callback);
        }, callback);
      }
    });
  });
}

if (require.main === module) {
  main(argv);
}
// exports for tests...
exports.getExtension = getExtension;
exports.parseFilename = parseFilename;
exports.getReplacementFilename = getReplacementFilename;
exports.renameEpisodeFile = renameEpisodeFile;
exports.main = main;
exports.trakt = trakt;
exports.argv = argv;
