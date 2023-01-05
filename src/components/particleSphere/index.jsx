import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import { AdditiveBlending, MathUtils } from "three"
import { ParticleSphereMaterial } from "./ParticleSphereMaterial"

const ParticleSphere = ({ count, ...props }) => {
  const ref = useRef()

  const radius = 2

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const distance = Math.sqrt(Math.random() - 0.5) * radius
      const theta = MathUtils.randFloatSpread(360)
      const phi = MathUtils.randFloatSpread(360)

      const x = distance * Math.sin(theta) * Math.cos(phi)
      const y = distance * Math.sin(theta) * Math.sin(phi)
      const z = distance * Math.cos(theta)

      positions.set([x, y, z], i * 3)
    }

    return positions
  }, [count])

  useFrame(({ clock }) => {
    ref.current.material.uniforms.uTime.value = clock.elapsedTime * 0.1
  })

  return (
    <points ref={ref} {...props}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <particleSphereMaterial
        key={ParticleSphereMaterial.key}
        blending={AdditiveBlending}
        depthWrite={false}
        uRadius={radius}
      />
    </points>
  )
}

export default ParticleSphere
