import { Sphere } from "@react-three/drei"

const PoseLandmarks = ({ landmarks, scale }) => (
  <>
    {landmarks.map((landmark, index) => (
      <Sphere
        key={index}
        scale={1}
        material-color={index === 19 || index === 20 ? "red" : "white"}
        position={[
          -(landmark.x * scale - scale / 2),
          -(landmark.y * scale - scale / 2),
          0,
        ]}
      />
    ))}
  </>
)

export default PoseLandmarks
