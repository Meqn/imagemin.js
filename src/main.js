import {
  isBlob,
  isImageType,
  filetoData,
  dataURLtoImage,
  arrayBufferToDataURL,
  canvasToBlob
} from './utils'

import resetOrientation from './orientation'

const DEFAULTS = {
  maxWidth: Infinity,
  maxHeight: Infinity,
  minWidth: 0,
  minHeight: 0,
  maxSize: Infinity,   // 单位：kb
  quality: 0.95,
  checkOrientation: true,
  mimeType: '',
  validated: null,  // ({ width, height, size, type })
  beforeDraw: null,
  drew: null,
  success: null,
  fail: null
}

export default class Comporessor {
  constructor(file, options) {
    this.file = file
    options.maxSize && (options.maxSize = options.maxSize * 1024) // 单位：kb
    if (options.quality < 0 || options.quality > 1) {
      options.quality = 0.95
    }
    this.options = Object.assign({}, DEFAULTS, options)
    this.init()
  }
  async init() {
    const { file, options } = this
    if (!isBlob(file)) {
      this.fail(new Error('The first argument must be a File or Blob object.'));
      return
    }

    const mimeType = file.type;
    if (!isImageType(mimeType)) {
      this.fail(new Error('The first argument must be an image File or Blob object.'));
      return;
    }

    if (!isImageType(options.mimeType)) {
      options.mimeType = mimeType
    }
    
    try {
      const data = {}
      data.size = file.size
      data.type = mimeType
      
      if (options.checkOrientation) {
        const arrBuffer = await filetoData(file, 'arrayBuffer')
        data.orientation = resetOrientation(arrBuffer)
        data.url = arrayBufferToDataURL(arrBuffer, options.mimeType)
      } else {
        data.url = await filetoData(file)
      }
      const image = await dataURLtoImage(data['url'])
      data.width = image.naturalWidth || image.width
      data.height = image.naturalHeight || image.height

      if (typeof options.validated === 'function') {
        (options.validated.call(this, data)) && this.draw(image, data)
      } else {
        this.draw(image, data)
      }
    } catch (error) {
      this.fail(error)
    }

  }
  async compress(canvas) {
    try {
      let { quality, maxSize, mimeType, success } = this.options
      let result = await canvasToBlob(canvas, {
        mimeType,
        quality
      })
      if (result.size > maxSize) {
        mimeType = mimeType === 'image/png' ? 'image/jpeg' : mimeType
        // timer = 7
        let timer = ~~(quality * 20)
        while(timer--) {
          quality -= 0.05
          result = await canvasToBlob(canvas, {
            mimeType,
            quality
          })
          if (quality < 0.1) {
            break
          }
          if (result.size < maxSize) {
            break
          }
        }
      }
      success && success(result)
    } catch (error) {
      this.fail(error)
    }
  }
  draw(image, { width, height, size, orientation = 1 }) {
    const { file, options } = this
    const { destWidth, destHeight } = this.resize({ width, height, size })
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (4 < orientation && orientation < 9) {
      canvas.width = destHeight
      canvas.height = destWidth
    } else {
      canvas.width = destWidth
      canvas.height = destHeight
    }

    let fillStyle = 'transparent';

    if (file.size > options.maxSize && options.mimeType === 'image/png') {
      fillStyle = '#fff'
    }

    // Override the default fill color (#000, black)
    ctx.fillStyle = fillStyle;
    ctx.fillRect(0, 0, destWidth, destHeight);

    typeof options.beforeDraw === 'function' && options.beforeDraw.call(this, ctx, canvas)
    
    switch (orientation) {
      case 2: ctx.transform(-1, 0, 0, 1, destWidth, 0); break;
      case 3: ctx.transform(-1, 0, 0, -1, destWidth, destHeight ); break;
      case 4: ctx.transform(1, 0, 0, -1, 0, destHeight ); break;
      case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
      case 6: ctx.transform(0, 1, -1, 0, destHeight , 0); break;
      case 7: ctx.transform(0, -1, -1, 0, destHeight , destWidth); break;
      case 8: ctx.transform(0, -1, 1, 0, 0, destWidth); break;
      default: break;
    }
    ctx.drawImage(image, 0, 0, destWidth, destHeight)

    typeof options.drew === 'function' && options.drew.call(this, ctx, canvas)
    this.compress(canvas)
  }
  resize({ width, height }) {
    const { maxWidth, maxHeight, minWidth, minHeight } = this.options
    const ratio = width / height
    let [destWidth, destHeight] = [width, height]

    if (width > maxWidth || height > maxHeight) {
      if (maxWidth / maxHeight > ratio) {
        destHeight = maxHeight
        destWidth = maxHeight * ratio
      } else {
        destWidth = maxWidth
        destHeight = maxWidth / ratio
      }
    }

    if (minWidth > 0 || minHeight > 0) {
      if (minWidth / minHeight > ratio) {
        destWidth = minWidth
        destHeight = minWidth / ratio
      } else {
        destHeight = minHeight
        destWidth = minHeight * ratio
      }
    }
    
    return {
      destWidth,
      destHeight
    }
  }
  fail(err) {
    const { options } = this;

    if (options.error) {
      options.error.call(this, err);
    } else {
      throw err;
    }
  }

  static setDefaults(options) {
    Object.assign(DEFAULTS, options)
  }

}
