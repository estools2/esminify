# esminify

## CLI usage

```
esminify -o dir.release srcdir

esminify -o dir.release --cmd true srcdir

esminify -o dir.release --cmd true --exclude /a,/b srcdir
```

help:
```
esminify
```


## Programable API


* process hole dir

```
// 输出到文件
const esminify = require('esminify');
esminify.minify({
  input: path.join(__dirname, 'your_source_dir'),
  output: path.join(__dirname, 'your_dest_dir')
});
```

* process custom code

```
var minifyCode = esminify.minify({
  code: 'your code here'
})
```

## `options` contains:

* input {Absolute Path}

  input path, can be an file or dir

* output {Absolute Path}

  output path

* code {String}

  input code for minify

* ast {AST Object}

  input code ast for minify, this is an optmize for pipeline process. sometime code already parsed into ast, so it's no-need to parse ast again

* config {Object}

  format 为混淆代码时的参数配置，默认配置如下。支持的所有option参见babili

* exclude {Array{RegExp}}

  exclude列表，每条规则为一个正则，TODO: 支持gitignore风格的字符串描述

* onFileProcess(obj) {Function}

  当每个文件被压缩之前，会调用这个方法，如果该方法返回`false`则取消压缩

```
esminify.minify({
  input: '/code_dir',
  output: '/code_compressed_dir',
  onFileProcess: function (info) {
    // this function called when each file starting processing
    // you can custom output message here
  }
});
```