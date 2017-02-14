'use strict';

var minify = require('./index');

let code = minify.minify({
  code: 'let test = [1, 2];',
  cmd: true
});

console.log(code);
