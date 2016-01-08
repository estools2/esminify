# esminify


```
const esminify = require('esminify');
let option = {
  srcDir: path.join(__dirname, 'out/release')
}
esminify.compile(option);
```

```
const esminify = require('esminify');
let option = {
  srcDir: path.join(__dirname, './'),
  destDir: path.join(__dirname, 'out/release')
}
esminify.compile(option);
```

```
const esminify = require('esminify');
let option = {
  srcDir: path.join(__dirname, './'),
  destDir: path.join(__dirname, 'out/release'),
  format: {
    // 支持的option见escodegen的api (https://github.com/estools/escodegen/wiki/API)
  }
}
esminify.compile(option);
```
