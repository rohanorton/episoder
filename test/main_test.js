/*jslint indent:2, node:true */
/*globals describe, it */
"use strict";

var main = require("../lib/main.js"),
  assert = require("assert");

describe("main", function () {
  describe("getExtension()", function () {
    it("should return correct extension", function (done) {
      assert.strictEqual(main.getExtension("Community S01E04.mp4"), "mp4");
      done();
    });
    it("should return correct extension in filenames with multiple dots", function (done) {
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
      done();
    });
    it("should return object with show, season and episode numbers from filename in s##e## form", function (done) {
      var result = main.getInfoFromFilename("community s01e04.mp4");
      assert.strictEqual(result.show, "Community", "show should be 'Community'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      done();
    });
    it("should return object with show, season and episode numbers from filename in #x## form", function (done) {
      var result = main.getInfoFromFilename("community 1x04.mp4");
      assert.strictEqual(result.show, "Community", "show should be 'Community'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      done();
    });
    it("should return object with show, season and episode numbers from filename in ### form", function (done) {
      var result = main.getInfoFromFilename("Community 104.mp4");
      assert.strictEqual(result.show, "Community", "show should be 'Community'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      done();
    });
    it("should return object with show, season and episode numbers from filename seperated by dots", function (done) {
      var result = main.getInfoFromFilename("Parks.And.Recreation.S01E04.mp4");
      assert.strictEqual(result.show, "Parks and Recreation", "show should be 'Parks and Recreation'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      done();
    });
    it("should return object with show, season and episode numbers even if there are numbers in the showname", function (done) {
      var result = main.getInfoFromFilename("30 Rock S01E04.mp4");
      assert.strictEqual(result.show, "30 Rock", "show should be '30 Rock'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      done();
    });
    it("should return object with show, season and episode numbers from filename with lots of trailing info", function (done) {
      var result = main.getInfoFromFilename("Parks and Recreation S01E04.720p.HDTV.X264-DIMENSION.mp4");
      assert.strictEqual(result.show, "Parks and Recreation", "show should be 'Parks and Recreation'");
      assert.strictEqual(result.season, 1, "season should be 1");
      assert.strictEqual(result.episode, 4, "episode should be 4");
      done();
    });

  });
});
