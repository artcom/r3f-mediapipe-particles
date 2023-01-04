import { useEffect, useRef } from "react"
import { Camera } from "@mediapipe/camera_utils"

import css from "./camera.module.css"
import { useControls } from "leva"

const CameraInput = ({ onFrame }) => {
  const { video } = useControls({ video: false })

  const videoRef = useRef()
  const cameraRef = useRef()

  const startCamera = () => {
    cameraRef.current?.start()
  }

  useEffect(() => {
    cameraRef.current = new Camera(videoRef.current, {
      onFrame: () => {
        onFrame({ image: videoRef.current })
      },
      facingMode: "user",
      width: 320,
      height: 240,
    })
  }, [])

  useEffect(() => {
    startCamera()
  }, [])

  return (
    <video
      className={css.cameraStream}
      ref={videoRef}
      style={{ display: `${video ? "inherit" : "none"}` }}></video>
  )
}

export default CameraInput
