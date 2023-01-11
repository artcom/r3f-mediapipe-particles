import { forwardRef, useImperativeHandle, useState } from "react"
import { useWorker } from "react-hooks-worker"
import { Particles } from "@artcom/r3f-mediapipe-particles"

const createWorker = () =>
  new Worker(new URL("./canvas.worker.js", import.meta.url), {
    type: "module",
  })

const ParticlesContext = forwardRef(({ options }, ref) => {
  const [image, setImage] = useState()

  useImperativeHandle(ref, () => ({
    setImage: (image) => setImage(image),
  }))

  const { result, error } = useWorker(createWorker, image)

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
