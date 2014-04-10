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
  });
});
