import { exposeWorker } from "react-hooks-worker"

const images = []
const offscreens = []
const width = 320
const height = 240
const pixelCount = width * height
const smoothCount = 4
const blur = 4
const thresholds = [100, 200]

for (let i = 0; i < smoothCount; i++) {
  offscreens[i] = new OffscreenCanvas(width, height)
  offscreens[i].getContext("2d").scale(1, -1)
  offscreens[i].getContext("2d").filter = `blur(${blur}px)`
  offscreens[i].getContext("2d").globalCompositeOperation = "copy"
}

const resultOffscreen = new OffscreenCanvas(width, height)
const resultOffscreenContext = resultOffscreen.getContext("2d")
resultOffscreenContext.scale(1, -1)
resultOffscreenContext.globalCompositeOperation = "copy"

const smoothImages = (image) => {
  if (image === undefined) {
    return
  }

  images.splice(0, 0, image)

  if (images.length > smoothCount) {
    images.pop()
  }

  if (images.length < smoothCount) {
    return
  }

  const result = []
  for (let i = 0; i < pixelCount * 4; i++) {
    result[i] = 0
  }

  for (let i = 0; i < images.length; i++) {
    const context = offscreens[i].getContext("2d")
    context.drawImage(images[i], 0, 0, width, -height)

    const imageData = context.getImageData(0, 0, width, height)
    for (let j = 0; j < pixelCount * 4; j++) {
      result[j] += imageData.data[j]
    }
  }

  const imageData = resultOffscreenContext.createImageData(width, height)
  for (let i = 0; i < pixelCount * 4; i++) {
    imageData.data[i] = result[i] / images.length
  }

  const indices = new Uint16Array(pixelCount)
  const offsets = new Float32Array(pixelCount * 3)

  let visibleCount = 0
  for (let i = 0; i < pixelCount; i++) {
    const value = imageData.data[i * 4 + 3]

    if (value >= thresholds[0] && value <= thresholds[1]) {
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
