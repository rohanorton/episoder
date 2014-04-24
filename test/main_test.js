/*jslint indent:2, node:true, nomen:true */
/*globals describe, it, beforeEach, afterEach */
"use strict";

var main = require("../lib/main.js"),
  assert = require("assert"),
  fs = require("fs"),
  monkey = require("monkey-patch"),
  mock = require("mock-fs");

describe("main.js", function () {
  beforeEach(function () {
    monkey.patch(main.trakt, {
      getTitle: function (episodeObject, callback) {
        episodeObject.title = "Testing One Two Three";
        callback(null, episodeObject);
      }
    });
  });
  afterEach(function () {
    monkey.unpatch(main.trakt);
  });
  describe("parseFilename()", function () {
    it("should return object with show in title case", function (done) {
      var result = main.parseFilename("parks and recreation S01E04.mp4");
      assert.strictEqual(result.show, "Parks and Recreation");
      done();
    });
    it("should return object with show, season and episode numbers from filename in S##E## form", function (done) {
      var result = main.parseFilename("Community S01E04.mp4");
      assert.strictEqual(result.show, "Community", "show should be 'Community'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, ".mp4", "extension should be '.mp4'");
      done();
    });
    it("should return object with show, season and episode numbers from filename in s##e## form", function (done) {
      var result = main.parseFilename("community s01e04.mp4");
      assert.strictEqual(result.show, "Community", "show should be 'Community'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, ".mp4", "extension should be '.mp4'");
      done();
    });
    it("should return object with show, season and episode numbers from filename in #x## form", function (done) {
      var result = main.parseFilename("community 1x04.mp4");
      assert.strictEqual(result.show, "Community", "show should be 'Community'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, ".mp4", "extension should be '.mp4'");
      done();
    });
    it("should return object with show, season and episode numbers from filename in #-## form", function (done) {
      var result = main.parseFilename("community 1-04.mp4");
      assert.strictEqual(result.show, "Community", "show should be 'Community'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, ".mp4", "extension should be '.mp4'");
      done();
    });
    it("should return object with show, season and episode numbers from filename in 'Season # Episode ##' form", function (done) {
      var result = main.parseFilename("Community Season 1 Episode 14.mp4");
      assert.strictEqual(result.show, "Community", "show should be 'Community'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 14, "episode should be 14");
      assert.strictEqual(result.extension, ".mp4", "extension should be '.mp4'");
      done();
    });
    it("should return object with show, season and episode numbers from filename in ### form", function (done) {
      var result = main.parseFilename("Community 104.mp4");
      assert.strictEqual(result.show, "Community", "show should be 'Community'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, ".mp4", "extension should be '.mp4'");
      done();
    });
    it("should return object with show, season and episode numbers from filename seperated by dots", function (done) {
      var result = main.parseFilename("Parks.And.Recreation.S01E04.mp4");
      assert.strictEqual(result.show, "Parks and Recreation", "show should be 'Parks and Recreation'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, ".mp4", "extension should be '.mp4'");
      done();
    });
    it("should return object with show, season and episode numbers even if there are numbers in the showname", function (done) {
      var result = main.parseFilename("30 Rock S01E04.mp4");
      assert.strictEqual(result.show, "30 Rock", "show should be '30 Rock'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, ".mp4", "extension should be '.mp4'");
      done();
    });
    it("should return object with show, season and episode numbers from filename with lots of trailing info", function (done) {
      var result = main.parseFilename("Parks and Recreation S01E04.720p.HDTV.X264-DIMENSION.mp4");
      assert.strictEqual(result.show, "Parks and Recreation", "show should be 'Parks and Recreation'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, ".mp4", "extension should be '.mp4'");
      done();
    });
    it("should return object with show, season and episode numbers from filename with trailing characters after showname", function (done) {
      var result = main.parseFilename("Parks and Recreation - S01E04.mp4");
      assert.strictEqual(result.show, "Parks and Recreation", "show should be 'Parks and Recreation'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, ".mp4", "extension should be '.mp4'");
      done();
    });
    it("should return null when filename doesn't match any patterns", function (done) {
      var result = main.parseFilename("this-is-a-really-useless-file-dontcha-think");
      assert.strictEqual(result, null);
      done();
    });
  });
  describe("getReplacementFilename()", function () {
    it("should return replacement filename", function (done) {
      main.getReplacementFilename("community s01e04.mp4", {}, function (err, replacementFilename) {
        assert(!err, "Should not error");
        assert.strictEqual(replacementFilename, "Community - S01E04 - Testing One Two Three.mp4");
        done();
      });
    });
  });
  describe("renameEpisodeFile()", function () {
    it("should rename episode file", function (done) {
      // create mock filesystem to test on...
      mock({
        "community s01e04.mp4": "An episode of Community"
      });
      main.renameEpisodeFile("community s01e04.mp4", {}, function () {
        fs.readdir(".", function (err, filelist) {
          assert(!err, "should not error");
          assert.strictEqual(filelist[0], "Community - S01E04 - Testing One Two Three.mp4");
          done();
        });
      });
    });
    it("should rename episode file in a different directory", function (done) {
      // create mock filesystem to test on...
      mock({
        "another_dir": {
          "sub_dir": {
            "community s01e04.mp4": "An episode of Community"
          }
        }
      });
      main.renameEpisodeFile("another_dir/sub_dir/community s01e04.mp4", {}, function () {
        fs.readdir("another_dir/sub_dir/", function (err, filelist) {
          assert(!err, "should not error");
          assert.strictEqual(filelist[0], "Community - S01E04 - Testing One Two Three.mp4");
          done();
        });
      });
    });
    it("shouldn't rename if file already exists", function (done) {
      // create mock filesystem to test on...
      mock({
        "community s01e04.mp4": "Episode to rename",
        "Community - S01E04 - Testing One Two Three.mp4": "Oh, hey! I already exist!"
      });
      main.renameEpisodeFile("community s01e04.mp4", {}, function (err) {
        assert(err, "should error");
        fs.readdir(".", function (err, filelist) {
          assert(!err, "should not error");
          assert.strictEqual(filelist[1], "community s01e04.mp4", "Filename should not have changed");
          done();
        });
      });
    });
    it("should rename if force flag enabled even if file already exists", function (done) {
      // create mock filesystem to test on...
      mock({
        "community s01e04.mp4": "Episode to rename",
        "Community - S01E04 - Testing One Two Three.mp4": "Oh, hey! I already exist!"
      });
      main.renameEpisodeFile("community s01e04.mp4", { force: true }, function (err) {
        assert(!err, "should not error");
        fs.readdir(".", function (err, filelist) {
          assert(!err, "should not error");
          assert.strictEqual(filelist[0], "Community - S01E04 - Testing One Two Three.mp4");
          assert.strictEqual(filelist[1], undefined, "There should only be one file now");
          done();
        });
      });
    });
  });
  describe("main()", function () {
    it("should rename file given filename", function (done) {
      mock({
        "community s01e04.mp4": "An episode of Community"
      });
      var args = { _: ["community s01e04.mp4"] };
      main.main(args, function () {
        fs.readdir(".", function (err, filelist) {
          assert(!err, "should not error");
          assert.strictEqual(filelist[0], "Community - S01E04 - Testing One Two Three.mp4");
          done();
        });
      });
    });
    it("should rename globbed files", function (done) {
      mock({
        "another_dir": {
          "community s01e01.mp4": "An episode of Community",
          "community s01e02.mp4": "An episode of Community",
          "community s01e03.mp4": "An episode of Community",
          "community s01e04.mp4": "An episode of Community",
          "community s01e04.txt": "An episode of Community"
        }
      });
      var args =  { _: ["another_dir/*mp4"] };
      // create mock filesystem to test on...
      main.main(args, function () {
        fs.readdir("another_dir/", function (err, filelist) {
          assert(!err, "should not error");
          assert.strictEqual(filelist[0], "Community - S01E01 - Testing One Two Three.mp4", "Should change specified files");
          assert.strictEqual(filelist[3], "Community - S01E04 - Testing One Two Three.mp4", "Should change specified files");
          assert.strictEqual(filelist[4], "community s01e04.txt", "Shouldn't change unspecified files");
          done();
        });
      });
    });
    it("should be able to offset search", function (done) {
      mock({
        "twin peaks - s01e00 - pilot.mkv": "An episode of Twin Peaks",
      });
      var args = {
        offset: 1,
        _: ["twin peaks - s01e00 - pilot.mkv"],
      };
      main.main(args, function () {
        fs.readdir(".", function (err, filelist) {
          assert(!err, "should not error");
          assert.strictEqual(filelist[0], "Twin Peaks - S01E01 - Testing One Two Three.mkv");
          done();
        });
      });
    });
    it("should be able to accept show flag", function (done) {
      mock({
        "S01E04.mp4": "An episode of an unknown show!"
      });
      var args = {
        _: ["S01E04.mp4"],
        show: "Community",
        offset: 0
      };
      main.main(args, function () {
        fs.readdir(".", function (err, filelist) {
          assert(!err, "should not error");
          // I have no idea why the index of this is zero,
          // weird.
          assert.strictEqual(filelist[0], "Community - S01E04 - Testing One Two Three.mp4");
          done();
        });
      });
    });
    it("should be able to accept season flag", function (done) {
      mock({
        "Community 04.mp4": "An episode of Community"
      });
      var args = {
        _: ["Community 04.mp4"],
        season: 1
      };
      main.main(args, function () {
        fs.readdir(".", function (err, filelist) {
          assert(!err, "should not error");
          // I have no idea why the index of this is zero,
          // weird.
          assert.strictEqual(filelist[0], "Community - S01E04 - Testing One Two Three.mp4");
          done();
        });
      });
    });
    it("should be able to accept episode flag", function (done) {
      mock({
        "Community 100.mp4": "An episode of Community"
      });
      var args = {
        _: ["*"],
        episode: 4
      };
      main.main(args, function () {
        fs.readdir(".", function (err, filelist) {
          assert(!err, "should not error");
          // I have no idea why the index of this is zero,
          // weird.
          assert.strictEqual(filelist[0], "Community - S01E04 - Testing One Two Three.mp4");
          done();
        });
      });
    });
    it("should be able to accept season flag with words", function (done) {
      mock({
        "Archer 2009 04.mp4": "An episode of Archer"
      });
      var args = {
        _: ["Archer 2009 04.mp4"],
        season: "specials"
      };
      main.main(args, function () {
        fs.readdir(".", function (err, filelist) {
          assert(!err, "should not error");
          // I have no idea why the index of this is zero,
          // weird.
          assert.strictEqual(filelist[0], "Archer 2009 - Specials E04 - Testing One Two Three.mp4");
          done();
        });
      });
    });
  });
});
