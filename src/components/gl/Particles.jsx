import { useFrame } from "@react-three/fiber"
import { useControls } from "leva"
import {
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

const Particles = forwardRef(({ debugCanvasRef }, ref) => {
  const [image, setImage] = useState()

  const particlesMaterialRef = useRef()

  const { blur, thresholds, mask } = useControls({
    thresholds: { value: [100, 200], min: 0, max: 255 },
    blur: { value: 9, min: 0, max: 50 },
    mask: false,
  })

  const data = useMemo(() => {
    if (image) {
      const { width, height } = image

      const pixelCount = width * height

      const offscreen = new OffscreenCanvas(width, height)
      const context = offscreen.getContext("2d")
      context.filter = `blur(${blur}px)`
      context.scale(1, -1)

      context.drawImage(image, 0, 0, width, height * -1)
      const imageData = context.getImageData(0, 0, width, height)

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

      const bitmap = offscreen.transferToImageBitmap()

      renderOffscreenToCanvas(debugCanvasRef, bitmap, width, height, mask)

      return {
        texture: new CanvasTexture(bitmap),
        attributes: { indices, offsets },
      }
    }
  }, [image, blur])

  useFrame(({ clock }) => {
    if (particlesMaterialRef.current) {
      particlesMaterialRef.current.uniforms.uTime.value = clock.elapsedTime
    }
  })

  useImperativeHandle(ref, () => ({
    setImage: (image) => {
      setImage(image)
    },
  }))

  const { random, depth, size, color, speed } = useControls({
    random: { value: 2.0, min: 0, max: 100 },
    depth: { value: -58.0, min: -100, max: 100 },
    size: { value: 1, min: 0.0, max: 10.0 },
    color: { value: { r: 235, g: 235, b: 235 } },
    speed: { value: 0.1, min: 0.0, max: 0.5 },
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
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  )
})

export default Particles
