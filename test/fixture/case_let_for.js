'use strict';
/**
 * 在 for 中定义  let 的场景
 *
 * TODO 还需要追加测试：  for (let a in b) {}  for (let a = 0; a < 1; a ++) {}
 */
function Proxy(options) {
}
/**
 * 请求时路由匹配，规则如下：
 *   1. 具体的域名优先，具体的域名中，最新注册的优先
 *   2. 泛域名(*) 其次，最新注册的优先
 *
 *  目前还不支持 *.xxx.com 这种泛域名解析， 以及 多版本 ab-test
 * @return {[type]} [description]
 */
Proxy.prototype._requestRouter = function (map, name, cb) {
  let apps = map[name];
  if (apps) {
    // for () {} scope 中, apps 不作为 forscope中的through
    // 所以当 forscope 时 generateName 需要判断 for 语句中是否已经使用过该变量名
    // 或者更简单的办法，检查 variableScope.__id_map__, 如果已经定义了该变量名，则跳过
    for (let app of apps) {
      cb(null, app, headers);
    }
  }
  apps = map['*'];
  if (apps) {
    for (let app of apps) {
      cb(null, app, headers);
    }
  }
  cb(new Error('router not found, path:'));
};