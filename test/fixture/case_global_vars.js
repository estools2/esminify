/**
 * 测试全局变量，模块变量
 *
 *  全局变量名保留
 *  模块变量名压缩
 */
var Table = function () {};
// Table.name = 'test';

function Car() {}
Car.prototype.name = 'abc';

module.exports = Car;