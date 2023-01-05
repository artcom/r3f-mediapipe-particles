varying float vDistance;

void main() {
  vec3 color = vec3(0.34, 0.53, 0.96);

  float strength = distance(gl_PointCoord, vec2(0.5));
  strength = 1.0 - strength;
  strength = pow(strength, 3.0);

  // Make particle close to the *center of the scene* a warmer color
  // and the ones on the outskirts a cooler color
  color = mix(color, vec3(0.97, 0.70, 0.45), vDistance * 0.5);
  color = mix(vec3(0.0), color, strength);

  // Here we're passing the strength in the alpha channel to make sure the outskirts
  // of the particle are not visible
  gl_FragColor = vec4(color, strength);
}
