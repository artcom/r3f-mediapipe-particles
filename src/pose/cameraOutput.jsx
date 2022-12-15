import { useEffect, useRef } from "react"
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils"
import { POSE_CONNECTIONS } from "@mediapipe/pose"

import css from "./camera.module.css"
import { PLAYER_TYPES, useStore } from "../store"
import { getCSSCustomProp } from "../utils"

const CameraOutput = () => {
  const canvasRef = useRef()

  function draw(poseLandmarks, image) {
    const canvasCtx = canvasRef.current.getContext("2d")

    if (image) {
      canvasCtx.drawImage(
        image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      )
    }

    if (poseLandmarks) {
      drawConnectors(
        canvasCtx,
        poseLandmarks,
        POSE_CONNECTIONS.slice(9),
        landmarkDrawOptions,
      )
      drawLandmarks(canvasCtx, poseLandmarks.slice(11), landmarkDrawOptions)
    }
  }

  return (
    <canvas
      className={`${css.cameraStream} ${
        cameraActive ? css.cameraStreamActive : ""
      }`}
      ref={canvasRef}></canvas>
  )
}

export default CameraOutput
