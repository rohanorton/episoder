/*jslint indent:2, node:true, nomen:true */
/*globals describe, it, beforeEach, afterEach */
"use strict";

var helpers = require("../lib/helpers.js"),
  assert = require("assert");

describe("helpers.js", function () {
  describe("optionalParams()", function () {
    it("should return an object with function parameters", function (done) {
      var results = helpers.optionalParams(1, 2, 3);
      assert.strictEqual(results.input, 1);
      assert.strictEqual(results.optional, 2);
      assert.strictEqual(results.callback, 3);
      done();
    });
    it("should return an object with function parameters when optional param not included", function (done) {
      var results = helpers.optionalParams(1, 3);
      assert.strictEqual(results.input, 1);
      assert.strictEqual(results.optional, undefined);
      assert.strictEqual(results.callback, 3);
      done();
    });
  });
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
