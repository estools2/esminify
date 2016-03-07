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

take look at this example

### `esminify.processFiles(options)`
```
const esminify = require('esminify');
esminify.minify({
  input: path.join(__dirname, 'your_source_dir'),
  output: path.join(__dirname, 'your_dest_dir')
});
```
`options` contains:

* input

  input path, can be an file or dir

* output

  output path

* config

  为混淆代码时的参数配置，默认配置如下。支持的所有option参见 escodegen的api (https://github.com/estools/escodegen/wiki/API)
```
const esminify = require('esminify');
let option = {
  input: path.join(__dirname, './'),
  output: path.join(__dirname, 'out/release'),
  config: {
    renumber: true,
    hexadecimal: true,
    escapeless: true,
    compact: true,
    semicolons: false,
    parentheses: false
  }
}
esminify.minify(option);
```
