/**
 * 测试全局依赖 和 函数参数 是否会冲突
 */
function test(p0, p1, p2) {
  a(b.option);
}
