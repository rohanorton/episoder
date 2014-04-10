/*jslint indent:2, node:true */
/*globals describe, it */
"use strict";

var main = require("../lib/main.js"),
  assert = require("assert");

describe("main", function () {
  describe("hello()", function () {
    it("should return 'hello world'", function (done) {
      assert.equal(main.hello(), "hello world");
      done();
    });
  });
});
