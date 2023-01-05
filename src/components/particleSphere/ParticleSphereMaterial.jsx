import { shaderMaterial } from "@react-three/drei"
import { extend } from "@react-three/fiber"
import fragmentShader from "./shaders/shader.frag?raw"
import vertexShader from "./shaders/shader.vert?raw"

const ParticleSphereMaterial = shaderMaterial(
  {
    uTime: 0.0,
    uRadius: 2,
  },
  vertexShader,
  fragmentShader,
)

ParticleSphereMaterial.key = `${Math.random()}`

extend({ ParticleSphereMaterial })

export { ParticleSphereMaterial }
