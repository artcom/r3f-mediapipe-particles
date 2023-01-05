import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Vector3 } from "three";
import fragmentShader from "../../shaders/particles.frag?raw";
import vertexShader from "../../shaders/particles.vert?raw";
const ParticlesMaterial = shaderMaterial({
  uTextureSize: null,
  uTexture: null,
  uTime: 0.0,
  uRandom: 1.0,
  uDepth: 30.0,
  uSize: 4.0,
  uSpeed: 0.1,
  uColor: new Vector3(0.34, 0.53, 0.96),
  uInnerColor: new Vector3(0.34, 0.53, 0.96),
  uExponent: 0.0
}, vertexShader, fragmentShader);
ParticlesMaterial.key = `${Math.random()}`;
extend({
  ParticlesMaterial
});
export { ParticlesMaterial };