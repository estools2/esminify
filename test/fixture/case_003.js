/**
 * let 场景
 */
'use strict';
const map = {};
function test(serverName, pathname, cb) {
  // router match
  let apps = map[serverName];
  if (apps) {
    for (let app of apps) {
      // let app = apps[i];
      // serverName and router match
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
  cb(new Error('router not found'));
}