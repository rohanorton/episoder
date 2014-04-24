/*jslint node:true, indent:2, unparam: true */
"use strict";

function zPad(num) {
  return (+num < 10 ? "0" : "") + num;
}

exports.zPad = zPad;
