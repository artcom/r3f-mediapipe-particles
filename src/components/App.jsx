import { OrbitControls, PerspectiveCamera, Stats } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense, useCallback, useRef } from "react"
import PoseDetection from "../pose/poseDetection"
import Particles from "./Particles"

const App = () => {
  const particlesRef = useRef()

  const onPoseResults = useCallback(({ segmentationMask }) => {
    if (segmentationMask) {
      particlesRef.current.setImage(segmentationMask)
    }
  }, [])

  return (
    <>
      <Canvas>
        <PerspectiveCamera
          makeDefault
          fov={50}
          near={1}
          far={10000}
          position={[0, 0, 300]}
        />
        <OrbitControls />
        <Particles ref={particlesRef} />
        <Stats />
      </Canvas>
      <Suspense>
        <PoseDetection onPoseResults={onPoseResults} />
      </Suspense>
    </>
  )
}

export default App
