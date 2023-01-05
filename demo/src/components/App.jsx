import {
  OrbitControls,
  PerspectiveCamera,
  Sphere,
  Stats,
} from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense, useCallback, useRef, useState } from "react"
import SelfieSegmentation from "./mediapipe/SelfieSegmentation"
import PoseDetection from "./mediapipe/PoseDetection"
import { useControls } from "leva"
import { Particles } from "@artcom/r3f-mediapipe-particles"

const App = () => {
  const options = useControls({
    solution: {
      value: "pose",
      options: ["pose", "selfie"],
    },
    thresholds: { value: [100, 200], min: 0, max: 255 },
    blur: { value: 4, min: 0, max: 50 },
    mask: false,
    smoothCount: { value: 4, min: 0, max: 10, step: 1 },
    random: { value: 2.0, min: 0, max: 100 },
    depth: { value: -58.0, min: -100, max: 100 },
    size: { value: 1, min: 0.0, max: 10.0 },
    color: { value: { r: 235, g: 235, b: 235 } },
    innerColor: { value: { r: 235, g: 235, b: 235 } },
    speed: { value: 0.1, min: 0.0, max: 0.5 },
    exponent: { value: 5.0, min: 0.0, max: 10.0 },
    zoom: { value: 1.35, min: 0, max: 2 },
    scale: { value: 360, min: 1, max: 1000 },
  })

  const [poseLandmarks, setPoseLandmarks] = useState([])

  const particlesRef = useRef()
  const canvasRef = useRef()

  const onResults = useCallback(
    ({ segmentationMask, poseLandmarks, poseWorldLandmarks }) => {
      if (segmentationMask) {
        particlesRef.current.setImage(segmentationMask)
      }

      if (poseLandmarks && poseLandmarks.length > 0) {
        setPoseLandmarks(poseLandmarks)
      }
    },
    [],
  )

  return (
    <>
      <Suspense>
        {options.solution === "pose" && <PoseDetection onResults={onResults} />}
        {options.solution === "selfie" && (
          <SelfieSegmentation onResults={onResults} />
        )}
      </Suspense>
      <canvas
        ref={canvasRef}
        width={320}
        height={240}
        className={"mask-canvas"}
      />
      <Canvas>
        <PerspectiveCamera
          makeDefault
          fov={50}
          near={0.01}
          far={10000}
          position={[0, 0, 300]}
          zoom={options.zoom}
        />
        <OrbitControls />
        <Particles
          ref={particlesRef}
          debugCanvasRef={canvasRef}
          width={320}
          height={240}
          options={options}
        />
        {poseLandmarks.map((landmark, index) => (
          <Sphere
            key={index}
            scale={1}
            material-color={index === 19 || index === 20 ? "red" : "white"}
            position={[
              -(landmark.x * options.scale - options.scale / 2),
              -(landmark.y * options.scale - options.scale / 2),
              0,
            ]}
          />
        ))}
        <Stats />
      </Canvas>
    </>
  )
}

export default App
