precision highp float;

uniform sampler2D uTexture;

varying vec2 vPUv;
varying vec2 vUv;

varying float vDistance;


void main() {
	// vec4 color = vec4(0.0);
	// vec2 uv = vUv;
	// vec2 puv = vPUv;

	// // pixel color
	// vec4 colA = texture2D(uTexture, puv);

	// // greyscale
	// float grey = colA.r * 0.21 + colA.g * 0.71 + colA.b * 0.07;
	// vec4 colB = vec4(grey, grey, 1.0, 1.0);

	// // circle
	// float border = 0.3;
	// float radius = 0.5;
	// float dist = radius - distance(uv, vec2(0.5));
	// float t = smoothstep(0.0, border, dist);

	// // final color
	// color = colB;
	// color.a = t * 0.8;

	// gl_FragColor = color;
	// // gl_FragColor = vec4(1.0,0.0,0.0,1.0);


	vec3 color = vec3(0.34, 0.53, 0.96);

  float strength = distance(vUv, vec2(0.5));
  strength = 1.0 - strength;
  strength = pow(strength, 3.0);

  // Make particle close to the *center of the scene* a warmer color
  // and the ones on the outskirts a cooler color
  color = mix(color, vec3(0.97, 0.70, 0.45), vUv.x * 0.5);
  color = mix(vec3(0.0), color, strength);

  // Here we're passing the strength in the alpha channel to make sure the outskirts
  // of the particle are not visible
  gl_FragColor = vec4(color, strength);
}