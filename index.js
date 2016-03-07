/*!
 * esminify: index.js
 * Authors  : 枫弦 <fengxian.yzg@alibaba-inc.com> (https://github.com/yuzhigang33)
 * Create   : 2016-01-08 16:30:28
 * CopyRight 2016 (c) Alibaba Group
 */

'use strict';

const fs = require('xfs');
const _ = require('lodash');
const path = require('path');
const esprima = require('esprima');
const esmangle = require('esmangle2');
const escodegen = require('escodegen');
const cwd = process.cwd();

const defaultFormat = {
  renumber: true,
  hexadecimal: true,
  escapeless: true,
  compact: true,
  semicolons: false,
  parentheses: false
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
  if (!opt.input) {
    throw new Error('missing dir in option.');
  }
}
/**
 * minify code
 * @param  {Object} opt
 *         - input
 *         - output
 *         - exclude
 *         - format
 *         - strictMod
 *         - cmd
 *           - globals []
 */
function minify(opt, callback) {
  checkRequiredOpt(opt);
  let src = opt.input.replace(/(\/|\\)$/, '');
  let dest = opt.output || src + '.min';
  let exclude = opt.exclude;
  let userFormat = opt.config || defaultFormat;
  let strictMod = opt.strictMod;

  if (!opt.forceOverrideExclude) {
    exclude = exclude.concat([
      /\.git\//,
      /\.svn\//,
      /node_modules\//
    ]);
  }
  let stats;
  try {
    stats = fs.statSync(src);
  } catch (e) {
    if (callback) {
      callback(new Error('input error' + e.message));
    } else {
      console.error('input error' + e.message);
    }
    return;
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

  function execFile(obj) {
    console.log('minify file:', obj.input.substr(cwd.length + 1), '>', obj.output.substr(cwd.length + 1));
    var code = fs.readFileSync(obj.input).toString().trim();
    var sheBang = false;
    if (code.charCodeAt(0) === 65279) {
      code = code.substr(1);
    }
    // cut the shebang
    if (code.indexOf('#!') === 0) {
      var firstLineEnd = code.indexOf('\n');
      sheBang = code.substr(0, firstLineEnd + 1);
      code = code.substr(firstLineEnd + 1);
    }
    let ast = esprima.parse(code);
    let optimized = esmangle.optimize(ast, null, {
      inStrictCode: strictMod
    });
    let result = esmangle.mangle(optimized, {
      cmd: opt.cmd
    });
    let output = escodegen.generate(result, {
      format: userFormat
    });
    if (sheBang) {
      output = sheBang + output;
    }
    fs.sync().save(obj.output, output);
  }

  if (stats.isDirectory()) {
    fs.walk(src, /\.js$/, function (err, file, done) {
      var relfile = file.substr(src.length);
      if (checkExclude(relfile)) {
        //console.log('exclude:', relfile);
        return done();
      }
      execFile({
        input: file,
        output: path.join(dest, relfile)
      }, userFormat, strictMod);
      done();
    }, function (err) {
      if (err) {
        if (callback) {
          callback(err);
        } else {
          console.log('compress file error', err.message);
        }
        return;
      }
      callback && callback();
    });
  } else {
    execFile({
      input: opt.input,
      output: dest
    }, userFormat, strictMod);
  }
}

// module.exports.compile = compile;
exports.processFiles = minify;

exports.minify = minify;
