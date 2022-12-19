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

const Particles = forwardRef((_, ref) => {
  const [canvasTexture, setCanvasTexture] = useState()

  const particlesMaterialRef = useRef()

  const { blur, thresholds } = useControls({
    thresholds: { value: [100, 200], min: 0, max: 255 },
    blur: { value: 40, min: 0, max: 50 },
  })

  const data = useMemo(() => {
    if (canvasTexture) {
      const { width, height } = canvasTexture.image

      const numPoints = width * height

      let numVisible = 0

      const offscreen = new OffscreenCanvas(width, height)
      const context = offscreen.getContext("2d")
      context.filter = `blur(${blur}px)`

      context.scale(1, -1)
      context.drawImage(canvasTexture.image, 0, 0, width, height * -1)

      const imgData = context.getImageData(
        0,
        0,
        offscreen.width,
        offscreen.height,
      )

      const originalColors = Float32Array.from(imgData.data)

      for (let i = 0; i < numPoints; i++) {
        if (
          originalColors[i * 4 + 3] >= thresholds[0] &&
          originalColors[i * 4 + 3] <= thresholds[1]
        )
          numVisible++
      }

      const indices = new Uint16Array(numPoints)
      const offsets = new Float32Array(numPoints * 3)

      for (let i = 0, j = 0; i < numPoints; i++) {
        if (
          originalColors[i * 4 + 3] <= thresholds[0] ||
          originalColors[i * 4 + 3] >= thresholds[1]
        ) {
          continue
        }

        offsets[j * 3 + 0] = i % width
        offsets[j * 3 + 1] = Math.floor(i / width)

        indices[j] = i

        j++
      }

      return {
        texture: new CanvasTexture(offscreen),
        attributes: { indices, offsets, numVisible },
      }
    }
  }, [canvasTexture, blur])

  useFrame(({ clock }) => {
    if (particlesMaterialRef.current) {
      particlesMaterialRef.current.uniforms.uTime.value = clock.elapsedTime
    }
  })

  useImperativeHandle(ref, () => ({
    setImage: (image) => {
      setCanvasTexture(new CanvasTexture(image))
    },
  }))

  const { random, depth, size, color, speed } = useControls({
    random: { value: 2.0, min: 0, max: 100 },
    depth: { value: 16.0, min: -100, max: 100 },
    size: { value: 6.0, min: 0, max: 100 },
    color: { value: { r: 87, g: 135, b: 245 } },
    speed: { value: 0.01, min: 0.0, max: 1.0 },
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
