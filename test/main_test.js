/*jslint indent:2, node:true */
/*globals describe, it */
"use strict";

var main = require("../lib/main.js"),
  assert = require("assert"),
  fs = require("fs"),
  mock = require("mock-fs");

describe("main.js", function () {
  describe("getExtension()", function () {
    it("should return correct extension from filename", function (done) {
      assert.strictEqual(main.getExtension("Community S01E04.mp4"), "mp4");
      done();
    });
    it("should return correct extension from filenames with multiple dots", function (done) {
      assert.strictEqual(main.getExtension("Community.S01E04.mp4"), "mp4");
      done();
    });
    it("should return lowercase extension", function (done) {
      assert.strictEqual(main.getExtension("COMMUNITY S01E04.MP4"), "mp4");
      done();
    });
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
      assert.strictEqual(result.extension, "mp4", "extension should be mp4");
      done();
    });
    it("should return object with show, season and episode numbers from filename in s##e## form", function (done) {
      var result = main.parseFilename("community s01e04.mp4");
      assert.strictEqual(result.show, "Community", "show should be 'Community'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, "mp4", "extension should be mp4");
      done();
    });
    it("should return object with show, season and episode numbers from filename in #x## form", function (done) {
      var result = main.parseFilename("community 1x04.mp4");
      assert.strictEqual(result.show, "Community", "show should be 'Community'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, "mp4", "extension should be mp4");
      done();
    });
    it("should return object with show, season and episode numbers from filename in #-## form", function (done) {
      var result = main.parseFilename("community 1-04.mp4");
      assert.strictEqual(result.show, "Community", "show should be 'Community'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, "mp4", "extension should be mp4");
      done();
    });
    it("should return object with show, season and episode numbers from filename in 'Season # Episode ##' form", function (done) {
      var result = main.parseFilename("Community Season 1 Episode 4.mp4");
      assert.strictEqual(result.show, "Community", "show should be 'Community'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, "mp4", "extension should be mp4");
      done();
    });
    it("should return object with show, season and episode numbers from filename in ### form", function (done) {
      var result = main.parseFilename("Community 104.mp4");
      assert.strictEqual(result.show, "Community", "show should be 'Community'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, "mp4", "extension should be mp4");
      done();
    });
    it("should return object with show, season and episode numbers from filename seperated by dots", function (done) {
      var result = main.parseFilename("Parks.And.Recreation.S01E04.mp4");
      assert.strictEqual(result.show, "Parks and Recreation", "show should be 'Parks and Recreation'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, "mp4", "extension should be mp4");
      done();
    });
    it("should return object with show, season and episode numbers even if there are numbers in the showname", function (done) {
      var result = main.parseFilename("30 Rock S01E04.mp4");
      assert.strictEqual(result.show, "30 Rock", "show should be '30 Rock'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, "mp4", "extension should be mp4");
      done();
    });
    it("should return object with show, season and episode numbers from filename with lots of trailing info", function (done) {
      var result = main.parseFilename("Parks and Recreation S01E04.720p.HDTV.X264-DIMENSION.mp4");
      assert.strictEqual(result.show, "Parks and Recreation", "show should be 'Parks and Recreation'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, "mp4", "extension should be mp4");
      done();
    });
    it("should return object with show, season and episode numbers from filename with trailing characters after showname", function (done) {
      var result = main.parseFilename("Parks and Recreation - S01E04.mp4");
      assert.strictEqual(result.show, "Parks and Recreation", "show should be 'Parks and Recreation'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, "mp4", "extension should be mp4");
      done();
    });
  });
  describe("zPad()", function () {
    it("should return zero padded number string for single digit numbers", function (done) {
      assert.strictEqual(main.zPad(4), "04");
      done();
    });
    it("should return number string for double digit numbers", function (done) {
      assert.strictEqual(main.zPad(34), "34");
      done();
    });
  });
  describe("getReplacementFilename()", function () {
    it("should return replacement filename", function (done) {
      main.getReplacementFilename("community s01e04.mp4", function (err, replacementFilename) {
        assert(!err, "Should not error");
        assert.strictEqual(replacementFilename, "Community - S01E04 - Social Psychology.mp4");
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
      main.renameEpisodeFile("community s01e04.mp4", function () {
        fs.readdir(".", function (err, filelist) {
          assert(!err, "should not error");
          assert.strictEqual(filelist[0], "Community - S01E04 - Social Psychology.mp4");
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
      main.renameEpisodeFile("another_dir/sub_dir/community s01e04.mp4", function () {
        fs.readdir("another_dir/sub_dir/", function (err, filelist) {
          assert(!err, "should not error");
          assert.strictEqual(filelist[0], "Community - S01E04 - Social Psychology.mp4");
          done();
        });
      });
    });
  });
  describe("main()", function () {
    it("should rename file given filename", function (done) {
      // create mock filesystem to test on...
      mock({
        "community s01e04.mp4": "An episode of Community"
      });
      main.main("community s01e04.mp4", function () {
        fs.readdir(".", function (err, filelist) {
          assert(!err, "should not error");
          assert.strictEqual(filelist[0], "Community - S01E04 - Social Psychology.mp4");
          done();
        });
      });
    });
    it("should rename globbed files", function (done) {
      // create mock filesystem to test on...
      mock({
        "another_dir": {
          "community s01e01.mp4": "An episode of Community",
          "community s01e02.mp4": "An episode of Community",
          "community s01e03.mp4": "An episode of Community",
          "community s01e04.mp4": "An episode of Community",
          "community s01e04.txt": "An episode of Community"
        }
      });
      main.main("another_dir/*mp4", function () {
        fs.readdir("another_dir/", function (err, filelist) {
          assert(!err, "should not error");
          assert.strictEqual(filelist[0], "Community - S01E01 - Pilot.mp4", "Should change specified files");
          assert.strictEqual(filelist[3], "Community - S01E04 - Social Psychology.mp4", "Should change specified files");
          assert.strictEqual(filelist[4], "community s01e04.txt", "Shouldn't change unspecified files");
          done();
        });
      });
    });
  });
});
