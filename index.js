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
 */
function minify(opt, callback) {
  checkRequiredOpt(opt);
  let src = opt.input.replace(/(\/|\\)$/, '');
  let dest = opt.output || src + '.min';
  let exclude = opt.exclude || opt.excludeDir;
  let userFormat = opt.format || defaultFormat;

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

  function execFile(obj) {
    var code = fs.readFileSync(obj.input).toString();
    let ast = esprima.parse(code);
    let optimized = esmangle.optimize(ast, null, {
      inStrictCode: true
    });
    let result = esmangle.mangle(optimized);
    let output = escodegen.generate(result, {
      format: userFormat
    });
    fs.sync().save(obj.output, output);
    console.log('minify file:', obj.input, '>', obj.output);
  }

  if (stats.isDirectory()) {
    fs.walk(src, /\.js$/, function (err, file, done) {
      var relfile = file.substr(src.length);
      execFile({
        input: file,
        output: path.join(dest, relfile)
      });
      done();
    }, function (err) {
      if (callback) {
        callback(err);
      } else {
        console.log('');
      }
    });
  } else {
    execFile({
      input: opt.input,
      output: opt.output
    });
  }

  /*
  if (exclude) {
    _.remove(files, function (f) {
      return excludeDir.indexOf(f) >= 0;
    });
  }

  let tobeReadFiles = [];
  let tobeWriteFiles = [];
  function getFiles(src, dest, fileArr) {
    fileArr.forEach(function (file) {
      let srcNewDir = src + '/' + file;
      let destNewDir = dest + '/' + file;
      let sts = fs.statSync(srcNewDir);
      if (sts.isDirectory()) {
        syncfs.mkdir(destNewDir);
        let subFiles = fs.readdirSync(srcNewDir);
        getFiles(srcNewDir, destNewDir, subFiles);
      } else {
        if (/\.(js)$/.test(file)) {
          tobeReadFiles.push(srcNewDir);
          tobeWriteFiles.push(destNewDir);
        }
      }
    });
  }
  getFiles(srcDir, destDir, files);

  tobeReadFiles.forEach(function (file, idx) {
    fs.readFile(file, function (err, data) {
      if (err) {
        return console.log(err);
      }
      let ast = esprima.parse(data.toString());
      let optimized = esmangle.optimize(ast, null, {
        inStrictCode: true
      });
      let result = esmangle.mangle(optimized);
      let output = escodegen.generate(result, {
        format: userFormat
      });
      fs.writeFile(tobeWriteFiles[idx], output, function (err) {
        if (err) {
          return console.log(err);
        }
        console.log(tobeWriteFiles[idx], 'minify success');
      });
    });
  });
  */
}

// module.exports.compile = compile;
exports.processFiles = minify;

exports.minify = minify;
