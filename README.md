# esminify

- srcDir为必传选项
```
const esminify = require('esminify');
let option = {
  srcDir: path.join(__dirname, 'out/release')
}
esminify.processFiles(option);
```

- destDir为可选配置项，如果不传则会覆盖srcDir中的文件
```
const esminify = require('esminify');
let option = {
  srcDir: path.join(__dirname, './'),
  destDir: path.join(__dirname, 'out/release')
}
esminify.processFiles(option);
```

- format为混淆代码时的参数配置，默认配置如下。支持的所有option参见 escodegen的api (https://github.com/estools/escodegen/wiki/API)
```
const esminify = require('esminify');
let option = {
  srcDir: path.join(__dirname, './'),
  destDir: path.join(__dirname, 'out/release'),
  format: {
    renumber: true,
    hexadecimal: true,
    escapeless: true,
    compact: true,
    semicolons: false,
    parentheses: false
  }
}
esminify.processFiles(option);
```
