/*jslint indent:2, node:true */
/*globals describe, it */
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
});
