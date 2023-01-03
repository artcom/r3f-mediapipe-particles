import { useFrame } from "@react-three/fiber"
import { useControls } from "leva"
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  AdditiveBlending,
  CanvasTexture,
  Float32BufferAttribute,
  Uint16BufferAttribute,
  Vector2,
  Vector3,
} from "three"
import { ParticlesMaterial } from "./ParticlesMaterial"

const renderOffscreenToCanvas = (
  debugCanvasRef,
  bitmap,
  width,
  height,
  visible,
) => {
  const debugContext = debugCanvasRef.current.getContext("2d")
  debugContext.clearRect(
    0,
    0,
    debugCanvasRef.current.width,
    debugCanvasRef.current.height,
  )
  debugContext.scale(1, -1)

  if (visible) {
    debugContext.drawImage(bitmap, 0, 0, width, height * -1)
  }
}

const Particles = forwardRef(({ debugCanvasRef, width, height }, ref) => {
  const [images, setImages] = useState([])

  const particlesMaterialRef = useRef()

  const { blur, thresholds, mask, smoothCount } = useControls({
    thresholds: { value: [100, 200], min: 0, max: 255 },
    blur: { value: 9, min: 0, max: 50 },
    mask: false,
    smoothCount: { value: 0, min: 0, max: 10, step: 1 },
  })

  const { resultOffscreen, resultOffscreenContext } = useMemo(() => {
    const resultOffscreen = new OffscreenCanvas(width, height)
    const resultOffscreenContext = resultOffscreen.getContext("2d")
    resultOffscreenContext.filter = `blur(${blur}px)`
    resultOffscreenContext.scale(1, -1)

    return { resultOffscreen, resultOffscreenContext }
  }, [width, height, blur])

  const offscreens = useMemo(() => {
    const offscreens = []

    for (let i = 0; i < images.length; i++) {
      offscreens[i] = new OffscreenCanvas(width, height)
      offscreens[i].getContext("2d").scale(1, -1)
    }

    return offscreens
  }, [images, width, height])

  const data = useMemo(() => {
    if (images.length < smoothCount || offscreens.length === 0) {
      return
    }

    const pixelCount = width * height

    let imageData

    if (smoothCount === 0) {
      offscreens[0]
        .getContext("2d")
        .drawImage(images[0], 0, 0, width, height * -1)
      imageData = offscreens[0]
        .getContext("2d")
        .getImageData(0, 0, width, height)
    } else {
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

      imageData = resultOffscreenContext.createImageData(width, height)
      for (let i = 0; i < pixelCount * 4; i++) {
        imageData.data[i] = result[i] / images.length
      }
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

    resultOffscreenContext.putImageData(imageData, 0, 0)
    const bitmap = resultOffscreen.transferToImageBitmap()
    renderOffscreenToCanvas(debugCanvasRef, bitmap, width, height, mask)

    return {
      texture: new CanvasTexture(bitmap),
      attributes: { indices, offsets },
    }
  }, [images, blur, resultOffscreen, resultOffscreenContext, offscreens])

  useFrame(({ clock }) => {
    if (particlesMaterialRef.current) {
      particlesMaterialRef.current.uniforms.uTime.value = clock.elapsedTime
    }
  })

  useImperativeHandle(ref, () => ({
    setImage: (image) =>
      setImages((state) => {
        if (state.length > smoothCount) {
          state.pop()
        }
        return [image, ...state]
      }),
  }))

  useEffect(() => {
    setImages([])
  }, [smoothCount])

  const { random, depth, size, color, innerColor, exponent, speed } =
    useControls({
      random: { value: 2.0, min: 0, max: 100 },
      depth: { value: -58.0, min: -100, max: 100 },
      size: { value: 1, min: 0.0, max: 10.0 },
      color: { value: { r: 235, g: 235, b: 235 } },
      innerColor: { value: { r: 235, g: 235, b: 235 } },
      speed: { value: 0.1, min: 0.0, max: 0.5 },
      exponent: { value: 5.0, min: 0.0, max: 10.0 },
    })

  return (
    <>
      {data && (
        <mesh rotation-y={Math.PI}>
          <instancedBufferGeometry
            index={new Uint16BufferAttribute([0, 2, 1, 2, 3, 1], 1)}
            attributes-position={
              new Float32BufferAttribute(
                [
                  -0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5,
                  0.0,
                ],
                3,
              )
            }
            attributes-uv={
              new Float32BufferAttribute(
                [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0],
                2,
              )
            }>
            <instancedBufferAttribute
              attach="attributes-pindex"
              args={[data.attributes.indices, 1, false]}
            />
            <instancedBufferAttribute
              attach="attributes-offset"
              args={[data.attributes.offsets, 3, false]}
            />
            <instancedBufferAttribute />
          </instancedBufferGeometry>
          <particlesMaterial
            ref={particlesMaterialRef}
            key={ParticlesMaterial.key}
            uTexture={data.texture}
            uTextureSize={
              new Vector2(data.texture.image.width, data.texture.image.height)
            }
            uRandom={random}
            uDepth={depth}
            uSize={size}
            uSpeed={speed}
            uColor={
              new Vector3(color.r / 255.0, color.g / 255.0, color.b / 255.0)
            }
            uInnerColor={
              new Vector3(
                innerColor.r / 255.0,
                innerColor.g / 255.0,
                innerColor.b / 255.0,
              )
            }
            uExponent={exponent}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  )
})

export default Particles
