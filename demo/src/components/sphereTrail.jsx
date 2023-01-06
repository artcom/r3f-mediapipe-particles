import { Sphere, Trail } from "@react-three/drei"
import { extend } from "@react-three/fiber"
import { MeshLineMaterial } from "meshline"
extend({ MeshLineMaterial })

const SphereTrail = ({ position }) => {
  return (
    <Trail
      width={100} // Width of the line
      length={1} // Length of the line
      decay={0.1} // How fast the line fades away
      attenuation={(width) => width * width} // A function to define the width in each point along it.
    >
      <Sphere
        position={position}
        scale={2}
        material-color={"#F8D628"}
        material-transparent={true}
        material-opacity={0.2}
      />

      <meshLineMaterial color={"#F8D628"} opacity={0.2} transparent={true} />
    </Trail>
  )
}

export default SphereTrail
