import { OrbitControls, PerspectiveCamera, useTexture } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { useMemo } from "react"
import {
  Float32BufferAttribute,
  LinearFilter,
  RGBAFormat,
  Uint16BufferAttribute,
  Vector2,
} from "three"
import { ParticlesMaterial } from "./ParticlesMaterial"

const Particles = () => {
  const texture = useTexture("./sample-01.png", (texture) => {
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
    texture.format = RGBAFormat
  })

  const { width, height } = texture.image

  const { indices, offsets } = useMemo(() => {
    const numPoints = width * height

    let numVisible = 0
    const threshold = 34

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    canvas.width = width
    canvas.height = height
    ctx.scale(1, -1)
    ctx.drawImage(texture.image, 0, 0, width, height * -1)
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const originalColors = Float32Array.from(imgData.data)

    for (let i = 0; i < numPoints; i++) {
      if (originalColors[i * 4 + 0] > threshold) numVisible++
    }

    const indices = new Uint16Array(numPoints)
    const offsets = new Float32Array(numPoints * 3)

    for (let i = 0, j = 0; i < numPoints; i++) {
      if (originalColors[i * 4 + 0] <= threshold) continue

      offsets[j * 3 + 0] = i % width
      offsets[j * 3 + 1] = Math.floor(i / width)

      indices[j] = i

      j++
    }

    return { indices, offsets, numVisible }
  }, [texture, width, height])

  return (
    <mesh>
      <instancedBufferGeometry
        index={new Uint16BufferAttribute([0, 2, 1, 2, 3, 1], 1)}
        attributes-position={
          new Float32BufferAttribute(
            [-0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5, 0.0],
            3,
          )
        }>
        <instancedBufferAttribute
          attach="attributes-pindex"
          args={[indices, 1, false]}
        />
        <instancedBufferAttribute
          attach="attributes-offset"
          args={[offsets, 3, false]}
        />
        <instancedBufferAttribute />
      </instancedBufferGeometry>
      <particlesMaterial
        key={ParticlesMaterial.key}
        transparent={true}
        depthTest={false}
        uTexture={texture}
        uTextureSize={new Vector2(width, height)}
      />
    </mesh>
  )
}

const App = () => {
  return (
    <Canvas gl={{ antialias: true, alpha: true }}>
      <PerspectiveCamera
        makeDefault
        fov={50}
        near={1}
        far={10000}
        position={[0, 0, 300]}
      />
      <gridHelper scale={100} />
      <axesHelper scale={100} />
      <OrbitControls />
      <Particles />
    </Canvas>
  )
}

export default App
