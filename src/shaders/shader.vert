precision highp float;

attribute float pindex;
attribute vec3 offset;
uniform vec2 uTextureSize;
uniform sampler2D uTexture;


float random(float n) {
	return fract(sin(n) * 43758.5453123);
}

void main() {
	vec2 puv = offset.xy / uTextureSize;

	vec3 displaced = offset;
	displaced.xy += vec2(random(pindex) - 0.5, random(offset.x + pindex) - 0.5);
	displaced.xy -= uTextureSize * 0.5;

	vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
	mvPosition.xyz += position * 2.0;// * psize;
	vec4 finalPosition = projectionMatrix * mvPosition;

	gl_Position = finalPosition;
}
