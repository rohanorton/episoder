/*jslint indent:2, node:true, nomen:true */
/*globals describe, it, beforeEach, afterEach */
"use strict";

var helpers = require("../lib/helpers.js"),
  assert = require("assert");

describe("helpers.js", function () {
  describe("zPad()", function () {
    it("should return zero padded number string for single digit numbers", function (done) {
      assert.strictEqual(helpers.zPad(4), "04");
      done();
    });
    it("should return number string for double digit numbers", function (done) {
      assert.strictEqual(helpers.zPad(34), "34");
      done();
    });
  });
});
