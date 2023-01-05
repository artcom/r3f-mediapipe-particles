import { Particles as ParticleImage } from "@artcom/r3f-mediapipe-particles"
import { OrbitControls, PerspectiveCamera, Stats } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { useControls } from "leva"
import { Suspense, useCallback, useRef, useState } from "react"
import ParticleSphere from "../../../src/components/particleSphere"
import PoseLandmarks from "./Landmarks"
import PoseDetection from "./mediapipe/PoseDetection"
import SelfieSegmentation from "./mediapipe/SelfieSegmentation"
import SphereTrail from "./sphereTrail"
import Trail from "./sphereTrail"

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
    landmarks: false,
    landmarksScale: { value: 360, min: 1, max: 1000 },
  })

  const [landmarks, setLandmarks] = useState([])

  const particlesRef = useRef()
  const canvasRef = useRef()

  const onResults = useCallback(({ segmentationMask, poseLandmarks }) => {
    if (segmentationMask) {
      particlesRef.current.setImage(segmentationMask)
    }

    if (poseLandmarks && poseLandmarks.length > 0) {
      setLandmarks(poseLandmarks)
    }
  }, [])

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
        <ParticleImage
          ref={particlesRef}
          debugCanvasRef={canvasRef}
          width={320}
          height={240}
          options={options}
        />

        {options.landmarks && (
          <PoseLandmarks landmarks={landmarks} scale={options.landmarksScale} />
        )}

        {landmarks.length > 0 && (
          <>
            {/* <ParticleSphere
              count={4000}
              scale={10}
              position={[
                -(
                  landmarks[19].x * options.landmarksScale -
                  options.landmarksScale / 2
                ),
                -(
                  landmarks[19].y * options.landmarksScale -
                  options.landmarksScale / 2
                ),
                0,
              ]}
            />
            <ParticleSphere
              count={4000}
              scale={10}
              position={[
                -(
                  landmarks[20].x * options.landmarksScale -
                  options.landmarksScale / 2
                ),
                -(
                  landmarks[20].y * options.landmarksScale -
                  options.landmarksScale / 2
                ),
                0,
              ]}
            /> */}

            <SphereTrail
              position={[
                -(
                  landmarks[19].x * options.landmarksScale -
                  options.landmarksScale / 2
                ),
                -(
                  landmarks[19].y * options.landmarksScale -
                  options.landmarksScale / 2
                ),
                0,
              ]}
            />
            <SphereTrail
              position={[
                -(
                  landmarks[20].x * options.landmarksScale -
                  options.landmarksScale / 2
                ),
                -(
                  landmarks[20].y * options.landmarksScale -
                  options.landmarksScale / 2
                ),
                0,
              ]}
            />
          </>
        )}

        <Stats />
      </Canvas>
    </>
  )
}

export default App
