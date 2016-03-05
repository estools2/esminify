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

function execFile(obj, strictMod) {
  console.log('minify file:', obj.input.substr(cwd.length + 1), '>', obj.output.substr(cwd.length + 1));
  var code = fs.readFileSync(obj.input).toString();
  let ast = esprima.parse(code);
  let optimized = esmangle.optimize(ast, null, {
    inStrictCode: strictMod
  });
  let result = esmangle.mangle(optimized);
  let output = escodegen.generate(result, {
    format: userFormat
  });
  fs.sync().save(obj.output, output);
}

/**
 * minify code
 * @param  {Object} opt
 *         - input
 *         - output
 *         - exclude
 *         - format
 *         - strictMod
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
      }, strictMod);
      done();
    }, function (err) {
      if (callback) {
        callback(err);
      } else {
        console.log('compress file error', relfile, err.message);
      }
    });
  } else {
    execFile({
      input: opt.input,
      output: opt.output
    }, strictMod);
  }
}

// module.exports.compile = compile;
exports.processFiles = minify;

exports.minify = minify;
