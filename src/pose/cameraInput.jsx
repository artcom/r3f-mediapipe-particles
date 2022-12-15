import { useEffect, useRef } from "react"
import { Camera } from "@mediapipe/camera_utils"

import css from "./camera.module.css"

const CameraInput = ({ onFrame }) => {
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

  return <video className={css.hide} ref={videoRef}></video>
}

export default CameraInput
