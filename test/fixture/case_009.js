/**
 * allow function
 */

filter.on('filter_query', (expr) => {
  ComCenter.getComIdsByType('profile').forEach((id) => {
    ComCenter.getComById(id).emit('filter_query', expr);
  });
});
let a = (c, d) => c(d);
let f = (c, e) => c+e;
function test(){
  console.log(1);
}

