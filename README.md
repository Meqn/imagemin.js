# browser-image-compressor

> A simple image compressor that can be used to compress and resize image, And you can specify the image compression size.  
> It use the Browser's native `canvas.toBlob` API to do the compression work.  
> You can use a File or Blob.  
> 
> 一个简单的图片压缩库，你可以在图片上传之前对其进行压缩，最后返回一个`Blob`对象。  
> 你也可以指定图片的压缩大小以及限制输出的尺寸。  
> 它使用浏览器 `canvas.toBlob` API进行压缩，这意味着它是有损压缩。如果图片是`png`格式，可能会最终转换成 `jpeg`，当然你可以控制它的输出背景。



## features

1. 指定压缩文件大小
2. 读取拍摄图像的`Exif.orientation` 值，并修正图像方向（仅JPEG图像）
3. 限制图片尺寸压缩的最大值或最小值
4. 支持 `png` 输出背景设置




## Getting started

### Install

```
npm install browser-image-compressor --save

# or 

yarn add browser-image-compressor
```

### Usage

```js
new Compressor(file[, options])
```

**file**

- Type: [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) or [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob)

The target image file for compressing.

**options**

- Type: `Object`
- Optional

The options for compressing. Check out the available [options]().

**Example**

```html
<input type="file" id="file" accept="image/*">
```

```js
import Compressor from 'browser-image-compressor'

$('#file').on('change', function(e) {
  const file = e.target.files[0]
  if (file && file.name) {
    new Compressor(file, {
      maxWidth: Infinity,
      maxHeight: Infinity,
      minWidth: 0,
      minHeight: 0,
      maxSize: 500,   // kb
      quality: 0.9,
      checkOrientation: true,
      mimeType: '',
      validated({ width, height, size, type }) {
        return true
      },
      beforeDraw(context, canvas) {
        context.fillStyle = '#ff0'
        context.fillRect(0, 0, canvas.width, canvas.height)
      },
      drew: (context, canvas) => {},
      success(result) {
        const formData = new FormData()
        formData.append('file', result)
        fetch('/api/v1/upload/', {
          method: 'POST',
          body: JSON.stringify(formData)
        })
          .then(res => res.json())
          .then(() => {
            console.log('upload success')
          })
      },
      fail: error => {}
    })
  }
})
```


## Browser support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)
- Edge (latest)
- Internet Explorer 10+



## Fork from

> `browser-image-compressor` Fork from: [compressorjs@fengyuanchen](https://github.com/fengyuanchen/compressorjs) 
> 
> 在开发拍摄图片上传功能时，发现部分移动设备拍摄上传的图片方向会自动旋转。在 [stackoverflow](https://stackoverflow.com/questions/20600800/) 找到了原因和解决方案，但是处理后在Android和iOS设备上表现不一致（可能是自己的代码有误，并未发现其他人提出该问题）。最后发现 [compressorjs](https://github.com/fengyuanchen/compressorjs) 比较符合预期，但是没有指定压缩大小功能，所以在 `compressorjs` 基础上增加了指定压缩大小的功能，并简化了部分源码。

## References

- [JS Client-Side Exif Orientation: Rotate and Mirror JPEG Images - stackoverflow](https://stackoverflow.com/questions/20600800/)
- [Accessing JPEG EXIF rotation data in JavaScript on the client side - stackoverflow](https://stackoverflow.com/questions/7584794/)
- [笔记：使用 JavaScript 读取 JPEG 文件 EXIF 信息中的 Orientation 值 - 知乎](https://zhuanlan.zhihu.com/p/25216999)


