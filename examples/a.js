/*!
 * esminify: examples/a.js
 * Authors  : 枫弦 <fengxian.yzg@alibaba-inc.com> (https://github.com/yuzhigang33)
 * Create   : 2016-01-08 16:30:28
 * CopyRight 2016 (c) Alibaba Group
 */
'use strict';
const path = require('path');
const esminify = require('../');

const option = {
  srcDir: path.join(__dirname, './srcFolder')
}
esminify.processFiles(option);
