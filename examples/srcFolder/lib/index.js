/*!
 * esminify: examples/srcFolder/lib/index.js
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

const syncfs = fs.sync();

function checkRequiredOpt(opt) {
  if (typeof opt !== 'object') {
    throw new Error('option must be an object.');
  }
  if (!opt.srcDir || typeof opt.srcDir !== 'string') {
    throw new Error('missing dir in option.');
  }
}

function minify(opt) {
  checkRequiredOpt(opt);
  let srcDir = opt.srcDir;
  let destDir = opt.destDir || srcDir;
  let excludeDir = opt.excludeDir;
  let files = fs.readdirSync(srcDir);

  if (excludeDir) {
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
          console.log(srcNewDir, '111');
          console.log(destNewDir, '222');
          tobeReadFiles.push(srcNewDir);
          tobeWriteFiles.push(destNewDir);
        }
      }
    });
  }
  getFiles(srcDir, destDir, files);
  console.log('=====================');
// process.exit();

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
        format: {
          renumber: true,
          hexadecimal: true,
          escapeless: true,
          compact: true,
          semicolons: false,
          parentheses: false
        }
      });
      fs.writeFile(tobeWriteFiles[idx], output, function (err) {
        if (err) {
          return console.log(err);
        }
        console.log(tobeWriteFiles[idx], 'minify success');
      });
    });
  });
}

module.exports.compile = minify;
