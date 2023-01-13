import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
var _excluded = ["bitmap", "indices", "offsets", "options"];
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import { AdditiveBlending, CanvasTexture, Float32BufferAttribute, Uint16BufferAttribute, Vector2, Vector3 } from "three";
import { ParticlesMaterial } from "./ParticlesMaterial";
import { Fragment as _Fragment } from "react/jsx-runtime";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var Particles = function Particles(_ref) {
  var bitmap = _ref.bitmap,
    indices = _ref.indices,
    offsets = _ref.offsets,
    options = _ref.options,
    props = _objectWithoutPropertiesLoose(_ref, _excluded);
  var _useState = useState(),
    texture = _useState[0],
    setTexture = _useState[1];
  var particlesMaterialRef = useRef();
  var random = options.random,
    depth = options.depth,
    size = options.size,
    color = options.color,
    innerColor = options.innerColor,
    exponent = options.exponent,
    speed = options.speed;
  useFrame(function (_ref2) {
    var clock = _ref2.clock;
    if (particlesMaterialRef.current) {
      particlesMaterialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });
  useEffect(function () {
    setTexture(new CanvasTexture(bitmap));
  }, [bitmap]);
  return /*#__PURE__*/_jsx(_Fragment, {
    children: texture && /*#__PURE__*/_jsxs("mesh", _extends({
      "rotation-y": Math.PI
    }, props, {
      children: [/*#__PURE__*/_jsxs("instancedBufferGeometry", {
        index: new Uint16BufferAttribute([0, 2, 1, 2, 3, 1], 1),
        "attributes-position": new Float32BufferAttribute([-0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5, 0.0], 3),
        "attributes-uv": new Float32BufferAttribute([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0], 2),
        children: [/*#__PURE__*/_jsx("instancedBufferAttribute", {
          attach: "attributes-pindex",
          args: [indices, 1, false]
        }), /*#__PURE__*/_jsx("instancedBufferAttribute", {
          attach: "attributes-offset",
          args: [offsets, 3, false]
        }), /*#__PURE__*/_jsx("instancedBufferAttribute", {})]
      }), /*#__PURE__*/_jsx("particlesMaterial", {
        ref: particlesMaterialRef,
        uTexture: texture,
        uTextureSize: new Vector2(texture.image.width, texture.image.height),
        uRandom: random,
        uDepth: depth,
        uSize: size,
        uSpeed: speed,
        uColor: new Vector3(color.r / 255.0, color.g / 255.0, color.b / 255.0),
        uInnerColor: new Vector3(innerColor.r / 255.0, innerColor.g / 255.0, innerColor.b / 255.0),
        uExponent: exponent,
        blending: AdditiveBlending,
        depthWrite: false
      }, ParticlesMaterial.key)]
    }))
  });
};
export default Particles;
//# sourceMappingURL=Particles.js.map