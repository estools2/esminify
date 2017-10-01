/*!
 * esminify: index.js
 * Authors  : 枫弦 <fengxian.yzg@alibaba-inc.com> (https://github.com/yuzhigang33)
 * Create   : 2016-01-08 16:30:28
 * CopyRight 2016 (c) Alibaba Group
 */

'use strict';

const fs = require('xfs');
const litelog = require('litelog');
const _ = require('lodash');
const path = require('path');
const babel = require('babel-core');
const babili = require('babel-preset-minify');

const defaultConfig = {
  removeDebugger: true,
  mangle: {
    blacklist: {},
    eval: true,
    keepFnName: false,
    topLevel: true,
    keepClassName: false
  },
  simplifyComparisons: false
};

function checkRequiredOpt(opt) {
  if (!opt.input) {
    opt.input = opt.srcDir;
  }
  if (!opt.output) {
    opt.output = opt.destDir;
  }

  if (typeof opt !== 'object') {
    throw new Error('option must be an object.');
  }
  if (!opt.input && !opt.code && !opt.ast) {
    throw new Error('missing dir in option.');
  }
}

function transform(opt) {
  opt = opt || {};
  if (opt.onFileProcess) {
    let pres = opt.onFileProcess(opt);
    if (pres === false) {
      return;
    }
  }
  var code;
  var res;
  var sheBang = false;

  var option = {
    // minified: true,
    presets: [
      [
        babili,
        opt.config
      ]
    ]
  };

  if (opt.ast) {
    res = babel.transformFromAst(opt.ast, '', option);
  } else {
    code = opt.code || fs.readFileSync(opt.input).toString().trim();
    // cut utf-8 bom header
    if (code.charCodeAt(0) === 65279) {
      code = code.substr(1);
    }
    // cut the shebang
    if (code.indexOf('#!') === 0) {
      let firstLineEnd = code.indexOf('\n');
      sheBang = code.substr(0, firstLineEnd + 1);
      code = code.substr(firstLineEnd + 1);
    }
    res = babel.transform(code, option);
  }

  if (sheBang) {
    res.code = sheBang + res.code;
  }

  if (opt.output) {
    fs.sync().save(opt.output, res.code);
  } else {
    return res.code;
  }
}
function genRule(rule) {
  if (rule.indexOf('/') === 0) {
    rule = '^' + rule;
  }
  return new RegExp(rule.replace(/\./g, '\\.').replace(/\*/g, '.*'));
}
/**
 * minify code
 * @param  {Object} opt
 *         - input {ABSPath}  filepath as input
 *         - output {ABSPath} filepath as output
 *         - code {String}  js code as iinput
 *         - ast {Object}
 *         - onFileProcess {Function}
 *         - exclude {Array} exclude paths
 *         - overrideExclude {Boolean}
 *         - config {Object} mangle config, see babili
 */
function minify(opt, callback) {
  checkRequiredOpt(opt);
  let src = opt.input && opt.input.replace(/(\/|\\)$/, '');
  let dest = opt.output;
  let exclude = opt.exclude || [];

  let log = opt.log || litelog.create({
    minify: {
      level: 'INFO'
    }
  }).get('minify');

  exclude.forEach((v, i, a)=> {
    if (typeof v === 'string') {
      a[i] = genRule(v);
    }
  });

  opt.config = _.merge({}, defaultConfig, opt.config);

  if (opt.keepTopLevel) {
    opt.config.mangle.topLevel = false;
  }

  if (!dest) {
    if (/\.\w+$/.test(src)) {
      dest = src.replace(/\.(\w+)$/, '.min.$1');
    } else {
      dest = src + '.min';
    }
  }

  if (!opt.overrideExclude) {
    exclude = exclude.concat([
      /\.git\//,
      /\.svn\//,
      /node_modules\//
    ]);
  }

  function checkExclude(file) {
    var flag = false;
    exclude.forEach(function (rule) {
      if (rule.test(file)) {
        flag = true;
      }
    });
    return flag;
  }

  if (opt.ast || opt.code) {
    return transform(opt);
  }

  let stats;
  try {
    stats = fs.statSync(src);
  } catch (e) {
    if (callback) {
      callback(new Error('input error' + e.message));
    } else {
      log.error('input error' + e.message);
    }
    return;
  }

  if (stats.isDirectory()) {
    var errs = [];
    fs.walk(src, function (file) {
      var relfile = file.substr(src.length);
      if (checkExclude(relfile)) {
        // console.log('exclude:', relfile);
        return false;
      }
      return true;
    }, function (err, file, done) {
      if (err) {
        log.error(err.stack);
        return done();
      }
      var relfile = file.substr(src.length);
      if (!/\.js$/.test(file)) {
        log.info('copy file:', relfile);
        fs.sync().save(path.join(dest, relfile), fs.readFileSync(file));
        return done();
      }
      try {
        transform(_.merge({}, opt, {
          input: file,
          output: path.join(dest, relfile),
        }));
      } catch (e) {
        log.error('error, file:', relfile, e.message, e.stack);
        e.file = relfile;
        errs.push(e);
      }
      done();
    }, function (err) {
      if (err) {
        if (callback) {
          callback(err);
        } else {
          log.error('compress file error', err.message);
        }
        return;
      }
      if (errs.length) {
        log.error('====== Error files ========');
        errs.forEach(function (err) {
          log.error('file:', err.file, err.message);
        });
        log.error('===========================');
      }
      callback && callback(errs.length ? errs : null);
    });
  } else {
    let code;
    let err = null;
    try {
      code = transform(opt);
    } catch (e) {
      err = e;
    }
    callback && callback(err, code);
  }
}

// module.exports.compile = compile;
exports.processFiles = minify;

exports.minify = minify;

/**
 * parse code into ast
 */
exports.parse = function (str, opt) {
  return babel.transform(str, {
    ast: true,
    code: false
  }).ast;
};
