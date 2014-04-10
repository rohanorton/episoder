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
    it("should return object with show", function (done) {
      var result = main.getInfoFromFilename("Community S01E04.mp4");
      assert.strictEqual(result.show, "Community");
      done();
    });
  });
});
