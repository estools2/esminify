/**
 * arrow function
 */
'use strict';
var filter = {on: function () {}};
filter.on('filter_query', (expr) => {
  test();
  ComCenter.getComIdsByType('profile').forEach((id) => {
    ComCenter.getComById(id).emit('filter_query', expr);
  });
  return 123;
});
let a = (c, d) => c(d);
let f = (c, e) => c+e;
let c = () => {
  if (a > 0) {
    a ++;
    a = a * b;
  } else {
    a --;
    return a / b;
  }
}
let d = 1;
function test(){
  console.log(1);
}

let empty_arrow_shold_fine = () => {}

