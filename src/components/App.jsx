import { OrbitControls, PerspectiveCamera, Stats } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense, useCallback, useRef } from "react"
import SelfieSegmentation from "./mediapipe/SelfieSegmentation"
import PoseDetection from "./mediapipe/PoseDetection"
import Particles from "./gl/Particles"
import { useControls } from "leva"

const App = () => {
  const { solution, zoom } = useControls({
    solution: {
      value: "pose",
      options: ["pose", "selfie"],
    },
    zoom: { value: 1.35, min: 0, max: 2 },
  })

  const particlesRef = useRef()
  const canvasRef = useRef()

  const onResults = useCallback(({ segmentationMask }) => {
    if (segmentationMask) {
      particlesRef.current.setImage(segmentationMask)
    }
  }, [])

  return (
    <>
      <Suspense>
        {solution === "pose" && <PoseDetection onResults={onResults} />}
        {solution === "selfie" && <SelfieSegmentation onResults={onResults} />}
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
          zoom={zoom}
        />
        <OrbitControls />
        <Particles ref={particlesRef} debugCanvasRef={canvasRef} />
        <Stats />
      </Canvas>
    </>
  )
}

export default App
