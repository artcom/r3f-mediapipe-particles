uniform float uTime;
uniform float uRadius;

varying float vDistance;

// Source: https://github.com/dmnsgn/glsl-rotate/blob/main/rotation-3d-y.glsl.js
mat3 rotation3dY(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(
    c, 0.0, -s,
    0.0, 1.0, 0.0,
    s, 0.0, c
  );
}

void main() {
  float distanceFactor = pow(uRadius - distance(position, vec3(0.0)), 2.0);
  float size = distanceFactor * 10.0;
  vec3 particlePosition = position * rotation3dY(uTime * 0.2 * distanceFactor);

  vDistance = distanceFactor;

  vec4 viewPosition = modelViewMatrix * vec4(particlePosition, 1.0);

  gl_Position = projectionMatrix * viewPosition;

  gl_PointSize = size;
  gl_PointSize *= (2.0 / - viewPosition.z);
}
