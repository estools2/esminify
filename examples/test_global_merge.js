var Utils = require('@ali/map-utils');
var L = require('leaflet');
var abc = require('abc');

function a () {
  Utils.test();
}

module.exports = Utils.merge(L, abc);
