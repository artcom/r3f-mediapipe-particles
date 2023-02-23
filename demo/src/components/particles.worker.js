import { exposeWorker } from "react-hooks-worker"

const _imageDataList = []
let _resultOffscreen
let _resultOffscreenContext
let _processOffscreenContext
let _width
let _height
let _smoothCount
let _blur
let _indices
let _positions
let _pixelCount

const init = (options, width, height) => {
  _smoothCount = options.smoothCount
  _blur = options.blur
  _width = width
  _height = height

  createProcessOffscreenContext()
  createResultOffscreen()
  createAttributeArrays()
}

const createResultOffscreen = () => {
  _resultOffscreen = new OffscreenCanvas(_width, _height)
  _resultOffscreenContext = _resultOffscreen.getContext("2d", {
    willReadFrequently: true,
  })
  // _resultOffscreenContext.scale(1, -1)
}

const createProcessOffscreenContext = () => {
  _processOffscreenContext = new OffscreenCanvas(_width, _height).getContext(
    "2d",
    {
      willReadFrequently: true,
    },
  )
  // _processOffscreenContext.scale(1, -1)
  _processOffscreenContext.globalCompositeOperation = "copy"
  _processOffscreenContext.filter = `blur(${_blur}px)`
}

const createAttributeArrays = () => {
  _pixelCount = _width * _height
  _indices = new Uint16Array(_pixelCount)
  _positions = new Float32Array(_pixelCount * 3)
}

const resetMaskBuffers = () => {
  _indices.fill(0)
  _positions.fill(0)
}

const createEmptyBitmap = () => {
  _resultOffscreenContext.clearRect(0, 0, _width, _height)
  return _resultOffscreen.transferToImageBitmap()
}

const getImageData = (image) => {
  _processOffscreenContext.drawImage(image, 0, 0, _width, _height)
  return _processOffscreenContext.getImageData(0, 0, _width, _height)
}

const updateMaskBuffers = (imageData, thresholds) => {
  let visibleCount = 0

  for (let i = 0; i < _pixelCount; i++) {
    const value = imageData.data[i * 4 + 3]

    if (value >= thresholds[0] && value <= thresholds[1]) {
      _positions[visibleCount * 3 + 0] = i % _width
      _positions[visibleCount * 3 + 1] = Math.floor(i / _width)

      _indices[visibleCount] = i

      visibleCount++
    }
  }
}

const createBitmap = (imageData) => {
  _resultOffscreenContext.putImageData(imageData, 0, 0)
  return _resultOffscreen.transferToImageBitmap()
}

const getAverageImageData = (imageDataList) => {
  const accumulatedValues = []

  for (let i = 0; i < _pixelCount; i++) {
    accumulatedValues[i] = 0
  }

  for (let i = 0; i < imageDataList.length; i++) {
    for (let j = 0; j < _pixelCount; j++) {
      accumulatedValues[j] += imageDataList[i].data[j * 4 + 3]
    }
  }

  const resultImageData = _resultOffscreenContext.createImageData(
    _width,
    _height,
  )
  for (let i = 0; i < _pixelCount; i++) {
    resultImageData.data[i * 4 + 3] =
      accumulatedValues[i] / imageDataList.length
  }

  return resultImageData
}

const processImage = ({ image, options, width, height }) => {
  if (
    options.smoothCount !== _smoothCount ||
    options.blur !== _blur ||
    width !== _width ||
    height !== _height
  ) {
    init(options, width, height)
  }

  resetMaskBuffers()

  if (!image) {
    return {
      bitmap: createEmptyBitmap(),
      indices: _indices,
      positions: _positions,
    }
  }

  let imageData
  if (_smoothCount > 1) {
    imageData = getAverageImageData([
      getImageData(image),
      ..._imageDataList.slice(0, _smoothCount - 1),
    ])
  } else {
    imageData = getImageData(image)
  }

  updateMaskBuffers(imageData, options.thresholds)

  return {
    bitmap: createBitmap(imageData),
    indices: _indices,
    positions: _positions,
  }
}

exposeWorker(processImage)
