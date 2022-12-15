import { shaderMaterial } from "@react-three/drei"
import { extend } from "@react-three/fiber"
import fragmentShader from "../shaders/shader.frag?raw"
import vertexShader from "../shaders/shader.vert?raw"

const ParticlesMaterial = shaderMaterial(
  {
    uTextureSize: null,
    uTime: 0.0,
    uRandom: 1.0,
    uDepth: 3.0,
    uSize: 4.0,
    uFrequency: 1.0,
  },
  vertexShader,
  fragmentShader,
)

ParticlesMaterial.key = `${Math.random()}`

extend({ ParticlesMaterial })

export { ParticlesMaterial }
