import { useFrame } from "@react-three/fiber"
import React, { useEffect, useRef, useState } from "react"
import {
  AdditiveBlending,
  CanvasTexture,
  Float32BufferAttribute,
  MathUtils,
  Uint16BufferAttribute,
  Vector2,
  Vector3,
} from "three"
import { ParticlesMaterial } from "./ParticlesMaterial"

const Particles = ({ bitmap, indices, offsets, options, ...props }) => {
  const [texture, setTexture] = useState()

  const particlesMaterialRef = useRef()

  const { color, innerColor } = options

  useFrame(({ clock }) => {
    if (particlesMaterialRef.current) {
      particlesMaterialRef.current.uniforms.uTime.value = clock.elapsedTime
    }

    const { color, innerColor, interpolationFactor, ...rest } = options
    for (const key in rest) {
      const name = `u${key.charAt(0).toUpperCase() + key.slice(1)}`
      particlesMaterialRef.current.uniforms[name].value = MathUtils.lerp(
        particlesMaterialRef.current.uniforms[name].value,
        options[key],
        options.interpolationFactor,
      )
    }
  })

  useEffect(() => {
    setTexture(new CanvasTexture(bitmap))
  }, [bitmap])

  return (
    <>
      {texture && (
        <mesh rotation-y={Math.PI} {...props}>
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
              args={[indices, 1, false]}
            />
            <instancedBufferAttribute
              attach="attributes-offset"
              args={[offsets, 3, false]}
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
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  )
}

export default Particles
