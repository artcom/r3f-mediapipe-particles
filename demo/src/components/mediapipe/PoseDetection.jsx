import { Pose } from "@mediapipe/pose"
import { memo } from "react"
import { suspend } from "suspend-react"
import CameraInput from "./CameraInput"

const PoseDetection = memo(({ onResults, cameraWidth, cameraHeight }) => {
  const pose = suspend(async () => {
    const pose = new Pose({
      locateFile: (file) => `pose/${file}`,
    })

    pose.setOptions({
      modelComplexity: 1,
      selfieMode: false,
      enableSegmentation: true,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    pose.onResults(onResults)

    await pose.initialize()

    return pose
  }, ["initPoseDetection", onResults])

  return (
    <>
      {pose && (
        <CameraInput
          width={cameraWidth}
          height={cameraHeight}
          onFrame={async (frameData) => await pose.send(frameData)}
        />
      )}
    </>
  )
})

export default PoseDetection
