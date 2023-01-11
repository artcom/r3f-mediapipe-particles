import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { useWorker } from "react-hooks-worker"
import { Particles } from "@artcom/r3f-mediapipe-particles"

const createWorker = () =>
  new Worker(new URL("./canvas.worker.js", import.meta.url), {
    type: "module",
  })

const ParticlesContext = forwardRef(({ options, canvasRef }, ref) => {
  const [image, setImage] = useState()

  useImperativeHandle(ref, () => ({
    setImage: (image) => setImage(image),
  }))

  const { result, error } = useWorker(createWorker, { image, options })

  useEffect(() => {
    if (!result || !canvasRef) return
    const debugContext = canvasRef.current.getContext("2d")
    debugContext.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    )
    debugContext.scale(1, -1)
    debugContext.drawImage(
      result.bitmap,
      0,
      0,
      result.bitmap.width,
      result.bitmap.height * -1,
    )
  }, [result, options.mask])

  return (
    <>
      {result && (
        <Particles
          bitmap={result.bitmap}
          indices={result.indices}
          offsets={result.offsets}
          options={options}
        />
      )}
    </>
  )
})

export default ParticlesContext
