/*jslint node:true, indent:2, unparam: true */
"use strict";

function optionalParams(input, optional, callback) {
  // this function is for dealing with optional parameters in functions i.e.:
  // someFunction(input, [options], callback)
  // input and callback are required, but optional is ... well... optional.
  var args = [];
  Array.prototype.push.apply(args, arguments);
  // remove undefined values from array
  args = args.filter(function (val) {
    return val !== undefined;
  });
  return {
    input: args.shift(),
    callback: args.pop(),
    optional: args.pop() || undefined
  };
}

function zPad(num) {
  return (+num < 10 ? "0" : "") + num;
}

exports.zPad = zPad;
exports.optionalParams = optionalParams;
