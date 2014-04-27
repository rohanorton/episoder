#!/usr/bin/env node
/*jslint node:true, indent:2, regexp:true, nomen:true */
"use strict";

var yargs = require("yargs")
    .usage("Rename downloaded TV episode files.\n $0 [options] [file]")
    .example("$0 community-s01e04.avi", "rename file to Community - S01E04 - Social Psychology.avi")
    .example("$0 --offset=-1 community-s01e04.avi", "rename file to Community - S01E03 - Introduction to Film.avi")
    .example("$0 -S Community -s 1 -e 2 unknown.avi", "rename file to Community - S01E02 - Spanish 101.avi")
    .describe("v", "Display version number")
    .alias("v", "version")
    .describe("h", "Display help")
    .alias("h", "help")
    .describe("S", "Stipulate showname")
    .alias("S", "show")
    .describe("s", "Stipulate season number")
    .alias("s", "season")
    .describe("e", "Stipulate episode number")
    .alias("e", "episode")
    .describe("o", "Offset episode number")
    .alias("o", "offset")
    .describe("f", "Force overwrite of existing files.")
    .alias("f", "force")
    .describe("save_api_key", "Saves your trakt api key"),
  argv = yargs.argv,
  episoder = argv.$0,
  trakt,
  path = require("path"),
  configPath = path.join(__dirname, "..", "config", "traktApiKey.js"),
  fs = require("fs"),
  glob = require("glob"),
  async = require("async"),
  titleCase = require("to-title-case"),
  errCouldNotRename = "unable to rename ",
  zPad = require("./helpers.js").zPad,
  sanitize = require("sanitize-filename"),
  packageJson = require("../package.json");

if (argv.save_api_key) {
  // using synchronous method, because nothing can happen until this has finished:
  try {
    /*jslint stupid: true*/
    fs.writeFileSync(configPath, "module.exports = '" + argv.save_api_key + "';\n");
    /*jslint stupid: false*/
  } catch (e) {
    if (e.code === "EACCES") {
      console.log("Permission denied. You probably need to be root to write this file.");
      process.exit(1);
    }
    console.log("There was an unexpected error writing your file:", JSON.stringify(e));
    process.exit(1);
  }
  console.log("Your api key has been written to file.");
  process.exit(0);
} else {
  trakt = require("./trakt");
}

// filename: string
// options: object
function parseFilename(filename, options) {
  var ext = path.extname(filename).toLowerCase(),
  // the following regex should match:
  //   Community S01E04.mp4
  //   Community s01e04.mp4
  //   Community 1x04.mp4
  //   Community 1-04.mp4
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

  if (options.episode) {
    episode = options.episode + offset;
    if (searchResults !== null) {
      searchResults.pop();
    }
  } else {
    episode = Number(searchResults.pop()) + offset;
  }

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

// filename: string
// options: object
function getReplacementFilename(filename, options, callback) {
  var episodeObject = parseFilename(filename, options);

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
    replacementFilename = sanitize(show + " - " + season + episode + " - " + title +  ext);

    callback(null, replacementFilename);
  });
}

// src: filepath string
// options: object
function renameEpisodeFile(src, options, callback) {
  var filename = path.basename(src),
    dir = path.dirname(src);

  getReplacementFilename(filename, options, function (err, replacementFilename) {
    if (err) {
      console.error(err);
      return;
    }

    var dest = path.join(dir, replacementFilename);

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

// args: object
function main(args, callback) {
  var globOptions = {
    mark: true // puts '/' at end of directories
  };

  // args._ is where optimist puts all arguments not associated with flags
  async.each(args._, function (files) {
    glob(files, globOptions, function (err, filenames) {
      if (err) {
        return callback(err);
      }
      if (filenames.length === 0) {
        return callback(new Error("cannot stat '" + files + "': No such file"));
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
  if (argv.version) {
    console.log(packageJson.version);
    process.exit(0);
  }
  if (argv.help) {
    yargs.showHelp();
    process.exit(0);
  }
  if (argv._.length === 0) {
    console.log(episoder + ": missing file operand.");
    console.log("Try '" + episoder + " --help' for more information.");
    process.exit(1);
  }
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
