

- [前端如何进行图片处理](https://mp.weixin.qq.com/s/WyS0buwa0wUny2AxzFARSA)
- [玩转前端二进制](https://juejin.im/post/5f01ddfee51d4534c36d8914)



## 图片压缩方案

> 使用 `Canvas` 压缩图片，有2种压缩方式：
> 1. 尺寸压缩
> 2. 质量压缩 (缺点：仅支持`jpeg, webp`格式，不过png可以压缩后转出为jpeg格式，但非透明)


- 优点：实现简单，参数可以配置化，自定义图片的尺寸，指定区域裁剪等等。
- 缺点：只有 jpeg 、webp 支持原图尺寸下图片质量的调整来达到压缩图片的效果，其他图片格式，仅能通过调节尺寸来实现


## 压缩流程

1. `input[file] => file`
2. `new FileReader()` -> `reader.readAsDataURL(file)` -> `reader.onload => url`
3. `new Image()` -> `img.onload => img`
4. `Canvas.drawImage(img)` -> `canvas.toBlob => File:Blob`



## 方法

- compress(file, [Number | Object])
- check({ width, height, size, type })


## 第三方库

- `blueimp-canvas-to-blob` : canvas-to-blob 兼容性方案
- `exif-js`




## 参考

- https://github.com/fengyuanchen/compressorjs/
- https://github.com/WangYuLue/image-conversion
- https://juejin.im/post/5a097b2ff265da43231a79fa
- https://learnku.com/articles/31706


1. png不支持质量压缩