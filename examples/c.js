/*!
 * esminify: examples/c.js
 * Authors  : 枫弦 <fengxian.yzg@alibaba-inc.com> (https://github.com/yuzhigang33)
 * Create   : 2016-01-08 16:59:22
 * CopyRight 2016 (c) Alibaba Group
 */
'use strict';
const path = require('path');
const esminify = require('../');

const option = {
  srcDir: path.join(__dirname, './srcFolder'),
  destDir: path.join(__dirname, './destFolder'),
  format: {
    renumber: true,
    hexadecimal: true,
    escapeless: true,
    compact: true,
    semicolons: false,
    parentheses: false
  }
}
esminify.processFiles(option);
