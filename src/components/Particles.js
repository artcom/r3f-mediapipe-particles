import { useFrame } from "@react-three/fiber"
import React, {
  forwardRef,
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

const Particles = forwardRef(
  ({ debugCanvasRef, width, height, options, ...props }, ref) => {
    const [image, setImage] = useState()

    const imageDataRef = useRef([])
    const particlesMaterialRef = useRef()

    const {
      blur,
      thresholds,
      mask,
      smoothCount,
      random,
      depth,
      size,
      color,
      innerColor,
      exponent,
      speed,
    } = options

    const { resultOffscreen, resultOffscreenContext } = useMemo(() => {
      const resultOffscreen = new OffscreenCanvas(width, height)
      const resultOffscreenContext = resultOffscreen.getContext("2d")
      resultOffscreenContext.scale(1, -1)

      return { resultOffscreen, resultOffscreenContext }
    }, [width, height])

    const data = useMemo(() => {
      if (!image) {
        return
      }

      const pixelCount = width * height

      const blurOffscreenContext = new OffscreenCanvas(
        width,
        height,
      ).getContext("2d")
      blurOffscreenContext.scale(1, -1)
      blurOffscreenContext.filter = `blur(${blur}px)`

      let resultImageData

      blurOffscreenContext.drawImage(image, 0, 0, width, height * -1)
      const currentImageData = blurOffscreenContext.getImageData(
        0,
        0,
        width,
        height,
      )
      imageDataRef.current = [
        currentImageData,
        ...imageDataRef.current.slice(0, smoothCount + 1),
      ]

      if (smoothCount === 0) {
        resultImageData = imageDataRef.current[0]
      } else {
        const result = new Array(pixelCount).fill(0)

        for (let i = 0; i < imageDataRef.current.length; i++) {
          for (let j = 0; j < pixelCount; j++) {
            result[j] += imageDataRef.current[i].data[j * 4 + 3]
          }
        }

        resultImageData = resultOffscreenContext.createImageData(width, height)
        for (let i = 0; i < pixelCount; i++) {
          resultImageData.data[i * 4 + 3] = result[i] / (smoothCount + 1)
        }
      }

      const indices = new Uint16Array(pixelCount)
      const offsets = new Float32Array(pixelCount * 3)

      let visibleCount = 0
      for (let i = 0; i < pixelCount; i++) {
        const value = resultImageData.data[i * 4 + 3]

        if (value >= thresholds[0] && value <= thresholds[1]) {
          offsets[visibleCount * 3 + 0] = i % width
          offsets[visibleCount * 3 + 1] = Math.floor(i / width)

          indices[visibleCount] = i

          visibleCount++
        }
      }

      resultOffscreenContext.putImageData(resultImageData, 0, 0)
      const bitmap = resultOffscreen.transferToImageBitmap()
      renderOffscreenToCanvas(debugCanvasRef, bitmap, width, height, mask)

      return {
        texture: new CanvasTexture(bitmap),
        attributes: { indices, offsets },
      }
    }, [image, resultOffscreen, resultOffscreenContext, blur])

    useFrame(({ clock }) => {
      if (particlesMaterialRef.current) {
        particlesMaterialRef.current.uniforms.uTime.value = clock.elapsedTime
      }
    })

    useImperativeHandle(ref, () => ({ setImage }))

    return (
      <>
        {data && (
          <mesh {...props}>
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
  },
)

export default Particles
