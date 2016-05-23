function test(cb) {
  const apps = {};
  const ref = this.children;
  for (let child in ref) {
    if (child === APPID_PROXY || child === APPID_ADMIN) {
      continue;
    }
    apps[child] = _.clone(ref[child].options);
  }
  return cb && cb(null, apps);
};