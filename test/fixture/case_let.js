/**
 * 测试let场景,
 *   在不同的块级区域中定义的let, 不能产生冲突， 并且不能和上层变量冲突let
 */
'use strict';

var map = {
  localhost: [1,2,3],
  'test.com': [4]
}
function test(serverName, cb) {
  // router match
  let apps = map[serverName];
  if (apps) {
    for (let app of apps) {
      return cb(null, app);
    }
  }
  apps = map['*'];
  if (apps) {
    for (let app of apps) {
      // let app = apps[i];
      // serverName and router match
      return cb(null, app);
    }
  }
  cb('empty');
}

module.exports = test;