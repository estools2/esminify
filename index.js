/*!
 * esminify: index.js
 * Authors  : 枫弦 <fengxian.yzg@alibaba-inc.com> (https://github.com/yuzhigang33)
 * Create   : 2016-01-08 16:30:28
 * CopyRight 2016 (c) Alibaba Group
 */

'use strict';

const fs = require('xfs');
const path = require('path');
const esprima = require('./lib/esprima');
const esmangle = require('esmangle2');
const escodegen = require('./lib/escodegen');

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
  if (!opt.input && !opt.code && !opt.ast) {
    throw new Error('missing dir in option.');
  }
}
/**
 * minify code
 * @param  {Object} opt
 *         - input {ABSPath}
 *         - code {String}
 *         - ast {Object}
 *         - output {ABSPath}
 *         - onFileProcess {Function}
 *         - exclude {String} exclude path
 *         - format {Object} mangle config, see esmangle config
 *         - config {Object} mangle config
 *         - strict {Boolean} if strict model
 *         - cmd {Boolean} if cmd module
 */
function minify(opt, callback) {
  checkRequiredOpt(opt);
  let src = opt.input && opt.input.replace(/(\/|\\)$/, '');
  let dest = opt.output;
  let exclude = opt.exclude || [];
  let userFormat = opt.format || opt.config || defaultFormat;
  let strictMod = opt.strict !== undefined ? opt.strict : opt.strictMod;
  let onFileProcess = opt.onFileProcess;

  if (!dest) {
    if (/\.\w+$/.test(src)) {
      dest = src.replace(/\.(\w+)$/, '.min.$1');
    } else {
      dest = src + '.min';
    }
  }

  if (!opt.forceOverrideExclude) {
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

  function execFile(obj) {
    if (onFileProcess) {
      onFileProcess(obj);
    }
    var ast;
    var code;
    var sheBang = false;

    if (obj.ast) {
      ast = obj.ast;
    } else {
      code = obj.code || fs.readFileSync(obj.input).toString().trim();
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
      ast = esprima.parse(code);
    }

    let optimized = esmangle.optimize(ast, null, {
      inStrictCode: strictMod
    });
    let result = esmangle.mangle(optimized, {
      ecmaVersion: 6,
      sourceType: opt.cmd ? 'module' : 'script'
    });
    let output = escodegen.generate(result, {
      format: userFormat
    });
    if (sheBang) {
      output = sheBang + output;
    }

    if (obj.output) {
      fs.sync().save(obj.output, output);
    } else {
      return output;
    }
  }

  if (opt.ast) {
    return execFile({
      ast: opt.ast,
      cmd: opt.cmd
    });
  }
  if (opt.code) {
    return execFile({
      code: opt.code,
      cmd: opt.cmd
    });
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
        console.log(err.stack);
        return done();
      }
      var relfile = file.substr(src.length);
      if (!/\.js$/.test(file)) {
        console.log('copy file:', relfile);
        fs.sync().save(path.join(dest, relfile), fs.readFileSync(file));
        return done();
      }
      try {
        execFile({
          input: file,
          output: path.join(dest, relfile),
          cmd: opt.cmd
        });
      } catch (e) {
        console.log('=================');
        console.log('error, file:', relfile, e.message, e.stack);
        e.file = relfile;
        errs.push(e);
        console.log('=================');
      }
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
      if (errs.length) {
        console.log('====== Error files ========');
        errs.forEach(function (err) {
          console.log('file:', err.file, err.message);
        });
        console.log('===========================');
      }
      callback && callback();
    });
  } else {
    execFile({
      input: opt.input,
      output: dest,
      cmd: opt.cmd
    });
  }
}

// module.exports.compile = compile;
exports.processFiles = minify;

exports.minify = minify;

exports.parse = function (str, opt) {
  return esprima.parse(str, opt);
};
exports.esprima = esprima;
