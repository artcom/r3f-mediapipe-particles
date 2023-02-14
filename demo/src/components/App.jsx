import { OrbitControls, PerspectiveCamera, Stats } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { useControls } from "leva"
import { Suspense, useCallback, useRef, useState } from "react"
import PoseLandmarks from "./Landmarks"
import PoseDetection from "./mediapipe/PoseDetection"
import SelfieSegmentation from "./mediapipe/SelfieSegmentation"
import ParticlesContext from "./ParticlesContext"
import SphereTrail from "./sphereTrail"

const App = () => {
  const [options] = useControls("Particles Options", () => ({
    solution: {
      value: "pose",
      options: ["pose", "selfie"],
    },

    zoom: { value: 1.35, min: 0, max: 2 },
    landmarks: false,
    landmarksScale: { value: 360, min: 1, max: 1000 },
    cameraWidth: 320,
    cameraHeight: 240,
  }))

  const [landmarks, setLandmarks] = useState([])

  const particlesRef = useRef()
  const canvasRef = useRef()

  const onResults = useCallback(({ segmentationMask, poseLandmarks }) => {
    if (segmentationMask) {
      particlesRef.current.setImage(segmentationMask)
    } else {
      particlesRef.current.setImage(null)
    }

    if (poseLandmarks && poseLandmarks.length > 0) {
      setLandmarks(poseLandmarks)
    }
  }, [])

  return (
    <>
      <Suspense>
        {options.solution === "pose" && (
          <PoseDetection
            onResults={onResults}
            cameraWidth={options.cameraWidth}
            cameraHeight={options.cameraHeight}
          />
        )}
        {options.solution === "selfie" && (
          <SelfieSegmentation
            onResults={onResults}
            cameraWidth={options.cameraWidth}
            cameraHeight={options.cameraHeight}
          />
        )}
      </Suspense>
      {options.mask && (
        <canvas
          ref={canvasRef}
          width={options.cameraWidth}
          height={options.cameraHeight}
          className={"mask-canvas"}
        />
      )}
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

        <ParticlesContext
          ref={particlesRef}
          canvasRef={options.mask ? canvasRef : null}
          width={options.cameraWidth}
          height={options.cameraHeight}
        />

        {options.landmarks && (
          <PoseLandmarks landmarks={landmarks} scale={options.landmarksScale} />
        )}

        {landmarks.length > 0 && (
          <>
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
