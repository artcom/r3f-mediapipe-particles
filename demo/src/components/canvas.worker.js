import { exposeWorker } from "react-hooks-worker"

let imagesData = []
let resultOffscreen
let resultOffscreenContext
let processOffscreenContext
let width
let height
let smoothCount
let blur
let indices
let offsets
let pixelCount

const init = (options) => {
  smoothCount = options.smoothCount
  width = options.cameraWidth
  height = options.cameraHeight
  blur = options.blur

  createProcessOffscreenContext()
  createResultOffscreen()
  createAttributeArrays()
}

const createResultOffscreen = () => {
  console.log("createResultOffscreen")

  resultOffscreen = new OffscreenCanvas(width, height)
  resultOffscreenContext = resultOffscreen.getContext("2d", {
    willReadFrequently: true,
  })
  resultOffscreenContext.scale(1, -1)
}

const createProcessOffscreenContext = () => {
  console.log("createProcessOffscreens")

  processOffscreenContext = new OffscreenCanvas(width, height).getContext("2d", {
    willReadFrequently: false,
  })
  processOffscreenContext.scale(1, -1)
  processOffscreenContext.globalCompositeOperation = "copy"
  processOffscreenContext.filter = `blur(${blur}px)`
}

const createAttributeArrays = () => {
  pixelCount = width * height
  indices = new Uint16Array(pixelCount)
  offsets = new Float32Array(pixelCount * 3)
}

const smoothImages = ({ image, options }) => {
  if (
    options.smoothCount !== smoothCount ||
    options.blur !== blur ||
    options.cameraWidth !== width ||
    options.cameraHeight !== height
  ) {
    init(options)
  }

  indices.fill(0)
  offsets.fill(0)

  if (!image) {
    resultOffscreenContext.clearRect(0, 0, width, height)
    return { bitmap: resultOffscreen.transferToImageBitmap(), indices, offsets }
  }

  processOffscreenContext.drawImage(image, 0, 0, width, height * -1)
  const currentImageData = processOffscreenContext.getImageData(0, 0, width, height)
  imagesData = [currentImageData, ...imagesData.slice(0, smoothCount - 1)]

  if (imagesData.length === smoothCount) {
    const result = []
    let resultImageData

    if (imagesData.length > 1) {
      for (let i = 0; i < pixelCount; i++) {
        result[i] = 0
      }

      for (let i = 0; i < imagesData.length; i++) {
        for (let j = 0; j < pixelCount; j++) {
          result[j] += imagesData[i].data[j * 4 + 3]
        }
      }

      resultImageData = resultOffscreenContext.createImageData(width, height)
      for (let i = 0; i < pixelCount; i++) {
        resultImageData.data[i * 4 + 3] = result[i] / imagesData.length
      }
    } else {
      resultImageData = imagesData[0]
    }

    let visibleCount = 0

    for (let i = 0; i < pixelCount; i++) {
      const value = resultImageData.data[i * 4 + 3]

      if (value >= options.thresholds[0] && value <= options.thresholds[1]) {
        offsets[visibleCount * 3 + 0] = i % width
        offsets[visibleCount * 3 + 1] = Math.floor(i / width)

        indices[visibleCount] = i

        visibleCount++
      }
    }

    resultOffscreenContext.putImageData(resultImageData, 0, 0)
    const bitmap = resultOffscreen.transferToImageBitmap()

    return {
      bitmap,
      indices,
      offsets,
    }
  }
}

exposeWorker(smoothImages)
