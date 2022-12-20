import { OrbitControls, PerspectiveCamera, Stats } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense, useCallback, useRef } from "react"
import PoseDetection from "../pose/poseDetection"
import Particles from "./Particles"

const App = () => {
  const particlesRef = useRef()
  const canvasRef = useRef()

  const onPoseResults = useCallback(({ segmentationMask }) => {
    if (segmentationMask) {
      particlesRef.current.setImage(segmentationMask)
    }
  }, [])

  return (
    <>
      <Suspense>
        <PoseDetection onPoseResults={onPoseResults} />
      </Suspense>
      <canvas
        ref={canvasRef}
        width={320}
        height={240}
        className={"silhouette-canvas"}
      />
      <Canvas>
        <PerspectiveCamera
          makeDefault
          fov={50}
          near={1}
          far={10000}
          position={[0, 0, 300]}
          zoom={1.35}
        />
        <OrbitControls />
        <Particles ref={particlesRef} debugCanvasRef={canvasRef} />
        <Stats />
      </Canvas>
    </>
  )
}

export default App
