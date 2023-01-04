precision highp float;

uniform sampler2D uTexture;
uniform vec3 uColor;
uniform vec3 uInnerColor;
uniform float uExponent;

varying vec2 vUv;
varying float vDistanceFactor;


void main() {
	vec3 color = uColor;

  float strength = distance(vUv, vec2(0.5));
  strength = 1.0 - strength;
  strength = pow(strength, uExponent);

	color = mix(color, uInnerColor, vDistanceFactor * 0.5);
  color = mix(vec3(0.0), color, strength);

  gl_FragColor = vec4(color, strength);
}
