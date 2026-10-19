#version 300 es
precision highp float;

in vec3 aPosition;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
uniform float uMorph;
out vec3 vNormal;

void main() {
    vec2 inverseAxesSquared = 1.0 / vec2(1.6 * 1.6, 1.9 * 1.9);
    vec2 squared = aPosition.xy * aPosition.xy * inverseAxesSquared;
    vec3 initial = vec3(aPosition.xy, squared.x + squared.y);
    vec3 finalPosition = vec3(aPosition.xy, squared.x - squared.y);
    vec3 position = mix(initial, finalPosition, uMorph);
    vec2 gradient = 2.0 * aPosition.xy * inverseAxesSquared;
    vec3 initialNormal = vec3(-gradient.x, -gradient.y, 1.0);
    vec3 finalNormal = vec3(-gradient.x, gradient.y, 1.0);
    vNormal = normalize(mat3(uModel) * mix(initialNormal, finalNormal, uMorph));
    gl_Position = uProjection * uView * uModel * vec4(position, 1.0);
}
