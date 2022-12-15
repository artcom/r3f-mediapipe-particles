import { useFrame } from "@react-three/fiber"
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
} from "three"
import { ParticlesMaterial } from "./ParticlesMaterial"

const Particles = forwardRef((_, ref) => {
  const [texture, setTexture] = useState()

  const particlesMaterialRef = useRef()

  const attributes = useMemo(() => {
    if (texture) {
      const { width, height } = texture.image

      const numPoints = width * height

      let numVisible = 0
      const range = [100, 200]

      const canvas = new OffscreenCanvas(width, height)
      const ctx = canvas.getContext("2d")

      ctx.scale(1, -1)
      ctx.drawImage(texture.image, 0, 0, width, height * -1)

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      const originalColors = Float32Array.from(imgData.data)

      for (let i = 0; i < numPoints; i++) {
        if (
          originalColors[i * 4 + 3] > range[0] &&
          originalColors[i * 4 + 3] < range[1]
        )
          numVisible++
      }

      const indices = new Uint16Array(numPoints)
      const offsets = new Float32Array(numPoints * 3)

      for (let i = 0, j = 0; i < numPoints; i++) {
        if (
          originalColors[i * 4 + 3] <= range[0] ||
          originalColors[i * 4 + 3] >= range[1]
        ) {
          continue
        }

        offsets[j * 3 + 0] = i % width
        offsets[j * 3 + 1] = Math.floor(i / width)

        indices[j] = i

        j++
      }

      return { indices, offsets, numVisible }
    }
  }, [texture])

  useFrame(({ clock }) => {
    if (particlesMaterialRef.current) {
      particlesMaterialRef.current.uniforms.uTime.value = clock.elapsedTime
    }
  })

  useImperativeHandle(ref, () => ({
    setImage: (image) => {
      setTexture(new CanvasTexture(image))
    },
  }))

  return (
    <>
      {attributes && (
        <mesh>
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
              args={[attributes.indices, 1, false]}
            />
            <instancedBufferAttribute
              attach="attributes-offset"
              args={[attributes.offsets, 3, false]}
            />
            <instancedBufferAttribute />
          </instancedBufferGeometry>
          <particlesMaterial
            ref={particlesMaterialRef}
            key={ParticlesMaterial.key}
            uTexture={texture}
            uTextureSize={
              new Vector2(texture.image.width, texture.image.height)
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
