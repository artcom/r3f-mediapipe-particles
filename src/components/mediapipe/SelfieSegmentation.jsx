import { SelfieSegmentation as Selfie } from "@mediapipe/selfie_segmentation"
import { memo } from "react"
import { suspend } from "suspend-react"
import CameraInput from "./cameraInput"

const SelfieSegmentation = memo(({ onResults }) => {
  const selfieSegmentation = suspend(async () => {
    const selfieSegmentation = new Selfie({
      locateFile: (file) => `selfie_segmentation/${file}`,
    })

    selfieSegmentation.setOptions({
      modelSelection: 0,
    })
    selfieSegmentation.onResults(onResults)

    return selfieSegmentation
  }, ["initSelfieSegmentation", onResults])

  return (
    <>
      {selfieSegmentation && (
        <CameraInput
          onFrame={async (frameData) =>
            await selfieSegmentation.send(frameData)
          }
        />
      )}
    </>
  )
})

export default SelfieSegmentation
