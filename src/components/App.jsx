import { OrbitControls, PerspectiveCamera, Stats } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Suspense, useCallback, useRef } from "react"
import PoseDetection from "../pose/poseDetection"
import Particles from "./Particles"

const App = () => {
  const canvasRef = useRef()
  const particlesRef = useRef()

  const onPoseResults = useCallback(({ segmentationMask }) => {
    const context = canvasRef.current.getContext("2d")
    context.save()
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

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
      <canvas ref={canvasRef} width={320} height={240} />
      <Suspense>
        <PoseDetection onPoseResults={onPoseResults} />
      </Suspense>
    </>
  )
}

export default App
