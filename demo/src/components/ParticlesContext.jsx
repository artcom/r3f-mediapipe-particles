import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { useWorker } from "react-hooks-worker"
import { Particles } from "@artcom/r3f-mediapipe-particles"
import { useControls } from "leva"

const createWorker = () =>
  new Worker(new URL("./particles.worker.js", import.meta.url), {
    type: "module",
  })

const ParticlesContext = forwardRef(
  ({ canvasRef, width, height, mask }, ref) => {
    const [uniforms] = useControls("Particle Uniforms", () => ({
      random: { value: 2.0, min: 0, max: 100 },
      depth: { value: -58.0, min: -100, max: 100 },
      size: { value: 1, min: 0.0, max: 10.0 },
      color: { value: { r: 235, g: 235, b: 235 } },
      innerColor: { value: { r: 235, g: 235, b: 235 } },
      speed: { value: 0.1, min: 0.0, max: 0.5 },
      exponent: { value: 5.0, min: 0.0, max: 10.0 },
    }))

    const [options] = useControls("Particles Options", () => ({
      thresholds: { value: [100, 200], min: 0, max: 255 },
      blur: { value: 0, min: 0, max: 50 },
      smoothCount: { value: 3, min: 1, max: 10, step: 1 },
      interpolationFactor: { value: 1, min: 0.001, max: 1.0, step: 0.001 },
    }))

    const [image, setImage] = useState()

    useImperativeHandle(ref, () => ({
      setImage: (image) => setImage(image),
    }))

    const { result } = useWorker(createWorker, {
      image,
      options,
      width,
      height,
    })

    useEffect(() => {
      if (!result || !canvasRef || !mask) return
      const debugContext = canvasRef.current.getContext("2d")
      debugContext.clearRect(0, 0, options.cameraWidth, options.cameraHeight)
      debugContext.scale(1, -1)
      debugContext.drawImage(
        result.bitmap,
        0,
        0,
        options.cameraWidth,
        options.cameraHeight,
      )
    }, [result, mask])

    return (
      <>
        {result && (
          <Particles
            bitmap={result.bitmap}
            indices={result.indices}
            offsets={result.positions}
            options={options}
            uniforms={uniforms}
          />
        )}
      </>
    )
  },
)

export default ParticlesContext
