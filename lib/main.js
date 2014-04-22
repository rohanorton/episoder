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
  sanitize = require("sanitize-filename"),
  i;

function parseFilename(filename, options) {
  // options is optional
  // but no need to use optionalParams() as there's no callback :)

  // this regex should match:
  //   Community S01E04.mp4
  //   Community s01e04.mp4
  //   Community 1x04.mp4
  //   Community 1-04.mp4
  var ext = filename.split(".").pop().toLowerCase(),
    re = /(.*)\D(\d{1,2})[ex\-](\d{1,2})/i,
    searchResults = filename.match(re),
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
    re = /(.*)Season.*?(\d{1,2}).*Episode\D*?(\d{1,2})/i;
    searchResults = filename.match(re);
  }

  if (searchResults === null) {
    // this regex should match:
    //   Community 104.mp4
    re = /(.*)\D(\d)(\d\d)\D/;
    searchResults = filename.match(re);
  }

  if (searchResults === null && options.season) {
    // this regex should match:
    //   Community 04.mp4
    // but only if we've specified a season with season flag
    re = /(.*)\D(\d+)\D/;
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

  episode = Number(searchResults.pop()) + offset;
  season = options.season || Number(searchResults.pop());

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
      episode = "E" + zPad(episodeObject.episode),
      title = episodeObject.title,
      ext = episodeObject.extension,
      replacementFilename;

    if (isNaN(Number(season))) {
      season = titleCase(season) + " ";
    } else {
      season = "S" + season;
    }
    replacementFilename = sanitize(show + " - " + season + episode + " - " + title +  "." + ext);

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
      console.error(err);
      return;
    }

    var dest = dir + replacementFilename;

    fs.stat(dest, function (err) {
      if ((err && err.code === "ENOENT") || (options && options.force)) {
        fs.rename(src, dest);
        console.log("renaming " + src + " to " + dest);
        return callback();
      }
      return callback(new Error("cannot rename " + src + " to " + dest +  ": file already exists. (Use --force to overwrite files)"));
    });
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
  main(argv, function (err) {
    if (err) {
      console.error(err.message);
    }
  });
}
// exports for tests...
exports.parseFilename = parseFilename;
exports.getReplacementFilename = getReplacementFilename;
exports.renameEpisodeFile = renameEpisodeFile;
exports.main = main;
exports.trakt = trakt;
exports.argv = argv;
