#version 300 es
precision highp float;

in vec3 aPosition;

void main() {
    float x = aPosition.x;
    float r = (1.0 + sin(x))
        * (1.0 + 0.9 * cos(8.0 * x))
        * (1.0 + 0.1 * cos(24.0 * x))
        * (0.5 + 0.05 * cos(140.0 * x));
    vec3 curve = vec3(r * cos(x), r * sin(x), aPosition.z);
    gl_Position = vec4(curve.xy / 2.5, curve.z, 1.0);
}
