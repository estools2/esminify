/*!
 * esminify: index.js
 * Authors  : 枫弦 <fengxian.yzg@alibaba-inc.com> (https://github.com/yuzhigang33)
 * Create   : 2016-01-08 16:30:28
 * CopyRight 2016 (c) Alibaba Group
 */

'use strict';

const fs = require('xfs');
const path = require('path');
const babel = require('babel-core');

const babelOptions = {
  comments: false,
  ast: false,
  presets: [
    [
      'babili',
      /** referer: https://github.com/babel/babili/tree/master/packages/babel-preset-babili#options */
      {
        evaluate: true, // - babel-plugin-minify-constant-folding
        deadcode: true, // - babel-plugin-minify-dead-code-elimination
        infinity: true, // - babel-plugin-minify-infinity
        mangle: {
          keepFnName: false,
          topLevel: true,
          eval: true,
          keepClassName: false,
          blacklist: []
        }, // - babel-plugin-minify-mangle-names
        numericLiterals: true, // - babel-plugin-minify-numeric-literals
        replace: true, // babel-plugin-minify-replace
        simplify: true, // - babel-plugin-minify-simplify
        mergeVars: true, // - babel-plugin-transform-merge-sibling-variables
        booleans: true, // - babel-plugin-transform-minify-booleans
        regexpConstructors: true, // - babel-plugin-transform-regexp-constructors
        removeConsole: false, // - (Default: false) - babel-plugin-transform-remove-console
        removeDebugger: true, // - (Default: false) - babel-plugin-transform-remove-debugger
        removeUndefined: true, // - babel-plugin-transform-remove-undefined
        undefinedToVoid: true, // - babel-plugin-transform-undefined-to-void
        // groups
        properties: true,
        unsafe: false
      }
    ]
  ]
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
 *         - config {Object} mangle config
 *         - strict {Boolean} if strict model
 *         - cmd {Boolean} if cmd module
 */
function minify(opt, callback) {
  checkRequiredOpt(opt);
  let src = opt.input && opt.input.replace(/(\/|\\)$/, '');
  let dest = opt.output;
  let exclude = opt.exclude || [];
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
  /**
   * minify code
   * @param  {Object} obj
   *         - ast ast input
   *         - code  souce code
   *         - input input file
   */
  function execFile(obj) {
    if (onFileProcess) {
      onFileProcess(obj);
    }
    var code;
    var sheBang = false;
    if (obj.ast) {
      code = babel.transformFromAst(obj.ast, babelOptions).code;
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
      code = babel.transform(code, babelOptions).code;
      console.log('>>>>', code);
    }
    if (sheBang) {
      code = sheBang + code;
    }

    if (obj.output) {
      fs.sync().save(obj.output, code);
    } else {
      return code;
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
      console.error('input error' + e.message); // eslint-disable-line
    }
    return;
  }

  if (stats.isDirectory()) {
    var errs = [];
    fs.walk(src, function (err, file, done) {
      if (err) {
        console.log(err.stack); // eslint-disable-line
        return done();
      }
      var relfile = file.substr(src.length);
      if (checkExclude(relfile)) {
        // console.log('exclude:', relfile);
        return done();
      }
      if (!/\.js$/.test(file)) {
        console.log('copy file:', relfile); // eslint-disable-line
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
        console.log('================='); // eslint-disable-line
        console.log('error, file:', relfile, e.message, e.stack); // eslint-disable-line
        e.file = relfile;
        errs.push(e);
        console.log('================='); // eslint-disable-line
      }
      done();
    }, function (err) {
      if (err) {
        if (callback) {
          callback(err);
        } else {
          console.log('compress file error', err.message); // eslint-disable-line
        }
        return;
      }
      if (errs.length) {
        console.log('====== Error files ========'); // eslint-disable-line
        errs.forEach(function (err) {
          console.log('file:', err.file, err.message); // eslint-disable-line
        });
        console.log('==========================='); // eslint-disable-line
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

exports.parse = function (str) {
  throw new Error('esminify.parse() is removed');
};
