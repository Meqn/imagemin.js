export function isBlob(value) {
  if (typeof Blob === 'undefined') {
    return false
  }
  return value instanceof Blob || Object.prototype.toString.call(value) === '[object Blob]'
}

export function isImageType(value) {
  const regExp = /^image\/.+$/
  return regExp.test(value)
}

/**
 * 文件File转 base64图片url
 * @param {[File | Blob]} file 文件File对象
 * @param {String} type 返回类型 ['arrayBuffer', 'dataURL']
 * @returns {Promise}
 */
export function filetoData(file, type = 'dataURL') {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = function (e) {
      resolve(e.target.result)
    }
    reader.onloadend = function () {
      reader = null
    }
    reader.onabort = function () {
      reject(new Error('Aborted to read the image with FileReader.'))
    }
    reader.onerror = function () {
      reject(new Error('Failed to read the image with FileReader.'))
    }
    if (type === 'arrayBuffer') {
      reader.readAsArrayBuffer(file)
    } else {
      reader.readAsDataURL(file)
    }
  })
}

/**
 * Base64转图片文件
 * @param {String} dataURL Base64图片url
 * @returns {Promise}
 */
export function dataURLtoImage(dataURL) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = function () {
      resolve(img)
    }
    img.onerror = function () {
      reject(new Error('Failed to load the image.'))
    }
    img.onabort = function () {
      reject(new Error('Aborted to load the image.'))
    }
    if (window.navigator && /(?:iPad|iPhone|iPod).*?AppleWebKit/i.test(window.navigator.userAgent)) {
      // Fix the `The operation is insecure` error (#57)
      img.crossOrigin = 'anonymous';
    }
    img.src = dataURL
  })
}

/**
 * Base64转 Blob文件 (为兼容 canvas.toBlob)
 * @param {String} dataURL Base64图片url
 * @returns {Blob}
 */
export function dataURLtoFile(dataURL, mimeType) {
  try {
    const arr = dataURL.split(',')
    let mime = arr[0].match(/:(.*?);/)[1]
    const binStr = atob(arr[1])
    let n = binStr.length
    let u8arr = new Uint8Array(n)

    while (n--) {
      u8arr[n] = binStr.charCodeAt(n);
    }
    return new Blob([u8arr], {
      type: mimeType || mime
    })
  } catch (error) {
    console.error(error)
  }
  
}

/**
 * Transform array buffer to Data URL.
 * @param {ArrayBuffer} arrayBuffer - The array buffer to transform.
 * @param {string} mimeType - The mime type of the Data URL.
 * @returns {string} The result Data URL.
 */
export function arrayBufferToDataURL(arrayBuffer, mimeType = 'image/jpeg') {
  const {
    btoa
  } = window
  const {
    fromCharCode
  } = String
  const chunks = [];
  const chunkSize = 8192;
  let uint8 = new Uint8Array(arrayBuffer);

  while (uint8.length > 0) {
    // XXX: Babel's `toConsumableArray` helper will throw error in IE or Safari 9
    // eslint-disable-next-line prefer-spread
    chunks.push(fromCharCode.apply(null, Array.from(uint8.subarray(0, chunkSize))));
    uint8 = uint8.subarray(chunkSize);
  }

  return `data:${mimeType};base64,${btoa(chunks.join(''))}`;
}

/**
 * canvas转 Blob文件
 * @param {Canvas} canvas canvas画布
 * @param {Object} param 配置参数
 * @param {String} param.mimeType The mime type of the Data URL.
 * @param {Number} param.quality 质量
 * @returns {Blob}
 */
export function canvasToBlob(canvas, {
  mimeType,
  quality
}) {
  return new Promise((resolve, reject) => {
    try {
      if (canvas.toBlob) {
        canvas.toBlob(resolve, mimeType, quality)
      } else {
        const blob = dataURLtoFile(canvas.toDataURL(mimeType, quality), mimeType)
        resolve(blob)
      }
    } catch (error) {
      reject(error)
    }
  })
}
