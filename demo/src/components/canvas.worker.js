import { exposeWorker } from "react-hooks-worker"

const images = []
const offscreens = []
let resultOffscreen
let resultOffscreenContext
let width
let height
let smoothCount
let blur

const createResultOffscreen = () => {
  console.log("createResultOffscreen")

  resultOffscreen = new OffscreenCanvas(width, height)
  resultOffscreenContext = resultOffscreen.getContext("2d", {
    willReadFrequently: true,
  })
  resultOffscreenContext.scale(1, -1)
}

const createProcessOffscreens = () => {
  console.log("createProcessOffscreens")

  for (let i = 0; i < smoothCount; i++) {
    offscreens[i] = new OffscreenCanvas(width, height)
    const context = offscreens[i].getContext("2d", {
      willReadFrequently: true,
    })
    context.scale(1, -1)
    context.globalCompositeOperation = "copy"
    context.filter = `blur(${blur}px)`
  }
}

const smoothImages = ({ image, options }) => {
  const pixelCount = options.cameraWidth * options.cameraHeight
  const indices = new Uint16Array(pixelCount)
  const offsets = new Float32Array(pixelCount * 3)

  if (
    options.smoothCount !== smoothCount ||
    options.blur !== blur ||
    options.cameraWidth !== width ||
    options.cameraHeight !== height
  ) {
    smoothCount = options.smoothCount
    width = options.cameraWidth
    height = options.cameraHeight
    blur = options.blur

    createProcessOffscreens()
    createResultOffscreen()
  }

  if (!image) {
    resultOffscreen
      .getContext("2d")
      .clearRect(0, 0, options.cameraWidth, options.cameraHeight)

    const bitmap = resultOffscreen.transferToImageBitmap()
    return { bitmap, indices, offsets }
  }

  images.splice(0, 0, image)

  if (images.length > smoothCount) {
    images.pop()
  }

  if (images.length < smoothCount) {
    return
  }

  const result = []
  let imageData

  if (images.length > 1) {
    for (let i = 0; i < pixelCount * 4; i++) {
      result[i] = 0
    }

    for (let i = 0; i < images.length; i++) {
      const context = offscreens[i].getContext("2d", {
        willReadFrequently: true,
      })

      context.drawImage(images[i], 0, 0, width, -height)

      const imageData = context.getImageData(0, 0, width, height)
      for (let j = 0; j < pixelCount * 4; j++) {
        result[j] += imageData.data[j]
      }
    }

    imageData = resultOffscreenContext.createImageData(width, height)
    for (let i = 0; i < pixelCount * 4; i++) {
      imageData.data[i] = result[i] / images.length
    }
  } else {
    const context = offscreens[0].getContext("2d", {
      willReadFrequently: true,
    })
    context.drawImage(images[0], 0, 0, width, -height)
    imageData = context.getImageData(0, 0, width, height)
  }

  let visibleCount = 0
  for (let i = 0; i < pixelCount; i++) {
    const value = imageData.data[i * 4 + 3]

    if (value >= options.thresholds[0] && value <= options.thresholds[1]) {
      offsets[visibleCount * 3 + 0] = i % width
      offsets[visibleCount * 3 + 1] = Math.floor(i / width)

      indices[visibleCount] = i

      visibleCount++
    }
  }

  resultOffscreen.getContext("2d").putImageData(imageData, 0, 0)
  const bitmap = resultOffscreen.transferToImageBitmap()

  return {
    bitmap,
    indices,
    offsets,
  }
}

exposeWorker(smoothImages)
