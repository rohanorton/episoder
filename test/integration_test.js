/*jslint indent:2, node:true, nomen:true */
/*globals describe, it, beforeEach, afterEach */
"use strict";

var main = require("../lib/main.js"),
  assert = require("assert"),
  fs = require("fs"),
  mock = require("mock-fs");

describe("integration", function () {
  describe("main()", function () {
    beforeEach(function () {
      // create mock filesystem to test on...
      mock({
        "community s01e04.mp4": "An episode of Community"
      });
    });
    it("should rename file given filename", function (done) {
      var args = { _: ["community s01e04.mp4"] };
      main.main(args, function () {
        fs.readdir(".", function (err, filelist) {
          assert(!err, "should not error");
          assert.strictEqual(filelist[0], "Community - S01E04 - Social Psychology.mp4");
          done();
        });
      });
    });
  });
});
