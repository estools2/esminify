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
