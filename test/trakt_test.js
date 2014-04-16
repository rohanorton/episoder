/*jslint indent:2, node:true */
/*globals describe, it, beforeEach */
"use strict";

var trakt = require("../lib/trakt.js"),
  assert = require("assert");

describe("trakt.js", function () {
  describe("getTitle()", function () {
    it("should return correct title", function (done) {
      var episodeObj = {
        show: "Community",
        season: 1,
        episode: 4
      };
      trakt.getTitle(episodeObj, function (err, res) {
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
      trakt.getTitle(episodeObj, function (err) {
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
      trakt.getTitle(episodeObj, function (err) {
        assert(err, "Should error");
        done();
      });
    });
  });
  describe("getEpisodeIndex()", function () {
    var mockTraktArray;

    beforeEach(function () {
      mockTraktArray = [
        {
          "episode": 1,
        },
        {
          "episode": 2,
        },
        {
          "episode": 3,
        },
        {
          "episode": 4,
        },
        {
          "episode": 5,
        }
      ];
    });

    it("should return index of array item that contains object matching episode number", function (done) {
      assert.strictEqual(trakt.getEpisodeIndex(mockTraktArray, 4), 3, "index should be 3");
      done();
    });
    it("should return index even when list of episodes has missing items", function (done) {
      // remove first item from array
      mockTraktArray.shift();
      assert.strictEqual(trakt.getEpisodeIndex(mockTraktArray, 4), 2, "index should be 2");
      done();
    });
    it("should return index even when list of episodes has extra items", function (done) {
      // insert item to beginning of array
      mockTraktArray.unshift({"episode": 0});
      assert.strictEqual(trakt.getEpisodeIndex(mockTraktArray, 4), 4, "index should be 4");
      done();
    });
    it("should return -1 if no episode match", function (done) {
      // remove episode from array
      mockTraktArray.splice(3, 1);
      assert.strictEqual(trakt.getEpisodeIndex(mockTraktArray, 4), (-1));
      done();
    });
  });
});
