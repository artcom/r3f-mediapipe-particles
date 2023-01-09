import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
var _excluded = ["debugCanvasRef", "width", "height", "options"];
import { Box } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { AdditiveBlending, CanvasTexture, Float32BufferAttribute, Uint16BufferAttribute, Vector2, Vector3 } from "three";
import { ParticlesMaterial } from "./ParticlesMaterial";
import { Fragment as _Fragment } from "react/jsx-runtime";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var renderOffscreenToCanvas = function renderOffscreenToCanvas(debugCanvasRef, bitmap, width, height, visible) {
  var debugContext = debugCanvasRef.current.getContext("2d");
  debugContext.clearRect(0, 0, debugCanvasRef.current.width, debugCanvasRef.current.height);
  debugContext.scale(1, -1);
  if (visible) {
    debugContext.drawImage(bitmap, 0, 0, width, height * -1);
  }
};
var Particles = /*#__PURE__*/forwardRef(function (_ref, ref) {
  var debugCanvasRef = _ref.debugCanvasRef,
    width = _ref.width,
    height = _ref.height,
    options = _ref.options,
    props = _objectWithoutPropertiesLoose(_ref, _excluded);
  var _useState = useState([]),
    images = _useState[0],
    setImages = _useState[1];
  var particlesMaterialRef = useRef();
  var blur = options.blur,
    thresholds = options.thresholds,
    mask = options.mask,
    smoothCount = options.smoothCount,
    random = options.random,
    depth = options.depth,
    size = options.size,
    color = options.color,
    innerColor = options.innerColor,
    exponent = options.exponent,
    speed = options.speed;
  var _useMemo = useMemo(function () {
      var resultOffscreen = new OffscreenCanvas(width, height);
      var resultOffscreenContext = resultOffscreen.getContext("2d");
      resultOffscreenContext.scale(1, -1);
      return {
        resultOffscreen: resultOffscreen,
        resultOffscreenContext: resultOffscreenContext
      };
    }, [width, height, blur]),
    resultOffscreen = _useMemo.resultOffscreen,
    resultOffscreenContext = _useMemo.resultOffscreenContext;
  var offscreens = useMemo(function () {
    var offscreens = [];
    for (var i = 0; i < images.length; i++) {
      offscreens[i] = new OffscreenCanvas(width, height);
      offscreens[i].getContext("2d").scale(1, -1);
      offscreens[i].getContext("2d").filter = "blur(" + blur + "px)";
    }
    return offscreens;
  }, [images, width, height, blur]);
  var data = useMemo(function () {
    if (images.length < smoothCount || offscreens.length === 0) {
      return;
    }
    var pixelCount = width * height;
    var imageData;
    if (smoothCount === 0) {
      offscreens[0].getContext("2d").drawImage(images[0], 0, 0, width, height * -1);
      imageData = offscreens[0].getContext("2d").getImageData(0, 0, width, height);
    } else {
      var result = [];
      for (var i = 0; i < pixelCount * 4; i++) {
        result[i] = 0;
      }
      for (var _i = 0; _i < images.length; _i++) {
        var context = offscreens[_i].getContext("2d");
        context.drawImage(images[_i], 0, 0, width, -height);
        var _imageData = context.getImageData(0, 0, width, height);
        for (var j = 0; j < pixelCount * 4; j++) {
          result[j] += _imageData.data[j];
        }
      }
      imageData = resultOffscreenContext.createImageData(width, height);
      for (var _i2 = 0; _i2 < pixelCount * 4; _i2++) {
        imageData.data[_i2] = result[_i2] / images.length;
      }
    }
    var indices = new Uint16Array(pixelCount);
    var offsets = new Float32Array(pixelCount * 3);
    var visibleCount = 0;
    for (var _i3 = 0; _i3 < pixelCount; _i3++) {
      var value = imageData.data[_i3 * 4 + 3];
      if (value >= thresholds[0] && value <= thresholds[1]) {
        offsets[visibleCount * 3 + 0] = _i3 % width;
        offsets[visibleCount * 3 + 1] = Math.floor(_i3 / width);
        indices[visibleCount] = _i3;
        visibleCount++;
      }
    }
    resultOffscreenContext.putImageData(imageData, 0, 0);
    var bitmap = resultOffscreen.transferToImageBitmap();
    renderOffscreenToCanvas(debugCanvasRef, bitmap, width, height, mask);
    return {
      texture: new CanvasTexture(bitmap),
      attributes: {
        indices: indices,
        offsets: offsets
      }
    };
  }, [images, blur, resultOffscreen, resultOffscreenContext, offscreens]);
  useFrame(function (_ref2) {
    var clock = _ref2.clock;
    if (particlesMaterialRef.current) {
      particlesMaterialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });
  useImperativeHandle(ref, function () {
    return {
      setImage: function setImage(image) {
        return setImages(function (state) {
          if (state.length > smoothCount) {
            state.pop();
          }
          return [image].concat(state);
        });
      }
    };
  });
  useEffect(function () {
    setImages([]);
  }, [smoothCount]);
  return /*#__PURE__*/_jsx(_Fragment, {
    children: data && /*#__PURE__*/_jsxs("mesh", _extends({}, props, {
      children: [/*#__PURE__*/_jsxs("instancedBufferGeometry", {
        index: new Uint16BufferAttribute([0, 2, 1, 2, 3, 1], 1),
        "attributes-position": new Float32BufferAttribute([-0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5, 0.0], 3),
        "attributes-uv": new Float32BufferAttribute([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0], 2),
        children: [/*#__PURE__*/_jsx("instancedBufferAttribute", {
          attach: "attributes-pindex",
          args: [data.attributes.indices, 1, false]
        }), /*#__PURE__*/_jsx("instancedBufferAttribute", {
          attach: "attributes-offset",
          args: [data.attributes.offsets, 3, false]
        }), /*#__PURE__*/_jsx("instancedBufferAttribute", {})]
      }), /*#__PURE__*/_jsx("particlesMaterial", {
        ref: particlesMaterialRef,
        uTexture: data.texture,
        uTextureSize: new Vector2(data.texture.image.width, data.texture.image.height),
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
});
export default Particles;