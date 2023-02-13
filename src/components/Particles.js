import { useFrame } from "@react-three/fiber"
import React, { forwardRef, useEffect, useRef, useState } from "react"
import {
  AdditiveBlending,
  CanvasTexture,
  Float32BufferAttribute,
  Uint16BufferAttribute,
  Vector2,
  Vector3,
} from "three"
import { ParticlesMaterial } from "./ParticlesMaterial"

const Particles = forwardRef(
  ({ bitmap, indices, offsets, options, uniforms, ...props }, ref) => {
    const [texture, setTexture] = useState()

    const particlesMaterialRef = useRef()

    useFrame(({ clock }) => {
      if (particlesMaterialRef.current) {
        particlesMaterialRef.current.uniforms.uTime.value = clock.elapsedTime
      }
    })

    useEffect(() => {
      setTexture(new CanvasTexture(bitmap))
    }, [bitmap])

    return (
      <>
        {texture && (
          <mesh rotation-y={Math.PI} {...props} ref={ref}>
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
                new Vector3(
                  uniforms.color.r / 255.0,
                  uniforms.color.g / 255.0,
                  uniforms.color.b / 255.0,
                )
              }
              uInnerColor={
                new Vector3(
                  uniforms.innerColor.r / 255.0,
                  uniforms.innerColor.g / 255.0,
                  uniforms.innerColor.b / 255.0,
                )
              }
              uSize={uniforms.size}
              uSpeed={uniforms.speed}
              uExponent={uniforms.exponent}
              uRandom={uniforms.random}
              uDepth={uniforms.depth}
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
