/*jslint indent:2, node:true */
/*globals describe, it */
"use strict";

var main = require("../lib/main.js"),
  assert = require("assert"),
  fs = require("fs"),
  mock = require("mock-fs");

describe("main", function () {
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
  describe("getInfoFromFilename()", function () {
    it("should return object with show in title case", function (done) {
      var result = main.getInfoFromFilename("parks and recreation S01E04.mp4");
      assert.strictEqual(result.show, "Parks and Recreation");
      done();
    });
    it("should return object with show, season and episode numbers from filename in S##E## form", function (done) {
      var result = main.getInfoFromFilename("Community S01E04.mp4");
      assert.strictEqual(result.show, "Community", "show should be 'Community'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, "mp4", "extension should be mp4");
      done();
    });
    it("should return object with show, season and episode numbers from filename in s##e## form", function (done) {
      var result = main.getInfoFromFilename("community s01e04.mp4");
      assert.strictEqual(result.show, "Community", "show should be 'Community'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, "mp4", "extension should be mp4");
      done();
    });
    it("should return object with show, season and episode numbers from filename in #x## form", function (done) {
      var result = main.getInfoFromFilename("community 1x04.mp4");
      assert.strictEqual(result.show, "Community", "show should be 'Community'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, "mp4", "extension should be mp4");
      done();
    });
    it("should return object with show, season and episode numbers from filename in ### form", function (done) {
      var result = main.getInfoFromFilename("Community 104.mp4");
      assert.strictEqual(result.show, "Community", "show should be 'Community'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, "mp4", "extension should be mp4");
      done();
    });
    it("should return object with show, season and episode numbers from filename seperated by dots", function (done) {
      var result = main.getInfoFromFilename("Parks.And.Recreation.S01E04.mp4");
      assert.strictEqual(result.show, "Parks and Recreation", "show should be 'Parks and Recreation'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, "mp4", "extension should be mp4");
      done();
    });
    it("should return object with show, season and episode numbers even if there are numbers in the showname", function (done) {
      var result = main.getInfoFromFilename("30 Rock S01E04.mp4");
      assert.strictEqual(result.show, "30 Rock", "show should be '30 Rock'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, "mp4", "extension should be mp4");
      done();
    });
    it("should return object with show, season and episode numbers from filename with lots of trailing info", function (done) {
      var result = main.getInfoFromFilename("Parks and Recreation S01E04.720p.HDTV.X264-DIMENSION.mp4");
      assert.strictEqual(result.show, "Parks and Recreation", "show should be 'Parks and Recreation'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      assert.strictEqual(result.extension, "mp4", "extension should be mp4");
      done();
    });
  });
  describe("getTitle()", function () {
    it("should return correct title", function (done) {
      var episodeObj = {
        show: "Community",
        season: 1,
        episode: 4
      };
      main.getTitle(episodeObj, function (err, res) {
        assert(!err, "Should not error");
        assert.strictEqual(res.title, "Social Psychology");
        done();
      });
    });
    it("should error when given wrong episode information", function (done) {
      var episodeObj = {
        show: "someshowthatdoesntexist",
        season: 99,
        episode: 99
      };
      main.getTitle(episodeObj, function (err) {
        assert(err, "Should error");
        done();
      });
    });
    it("should error when given bad episode information", function (done) {
      var episodeObj = {
        show: undefined,
        season: undefined,
        episode: undefined
      };
      main.getTitle(episodeObj, function (err) {
        assert(err, "Should error");
        done();
      });
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
  });
});
