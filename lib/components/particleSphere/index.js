import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
var _excluded = ["count"];
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, MathUtils } from "three";
import { ParticleSphereMaterial } from "./ParticleSphereMaterial";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var ParticleSphere = function ParticleSphere(_ref) {
  var count = _ref.count,
    props = _objectWithoutPropertiesLoose(_ref, _excluded);
  var ref = useRef();
  var radius = 2;
  var particlesPosition = useMemo(function () {
    var positions = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      var distance = Math.sqrt(Math.random() - 0.5) * radius;
      var theta = MathUtils.randFloatSpread(360);
      var phi = MathUtils.randFloatSpread(360);
      var x = distance * Math.sin(theta) * Math.cos(phi);
      var y = distance * Math.sin(theta) * Math.sin(phi);
      var z = distance * Math.cos(theta);
      positions.set([x, y, z], i * 3);
    }
    return positions;
  }, [count]);
  useFrame(function (_ref2) {
    var clock = _ref2.clock;
    ref.current.material.uniforms.uTime.value = clock.elapsedTime * 0.1;
  });
  return /*#__PURE__*/_jsxs("points", _extends({
    ref: ref
  }, props, {
    children: [/*#__PURE__*/_jsx("bufferGeometry", {
      children: /*#__PURE__*/_jsx("bufferAttribute", {
        attach: "attributes-position",
        count: particlesPosition.length / 3,
        array: particlesPosition,
        itemSize: 3
      })
    }), /*#__PURE__*/_jsx("particleSphereMaterial", {
      blending: AdditiveBlending,
      depthWrite: false,
      uRadius: radius
    }, ParticleSphereMaterial.key)]
  }));
};
export default ParticleSphere;