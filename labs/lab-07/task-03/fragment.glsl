#version 300 es
precision highp float;

in vec3 vNormal;
uniform bool uWireframe;
out vec4 outColor;

void main() {
    if (uWireframe) {
        outColor = vec4(0.25, 0.9, 0.73, 1.0);
        return;
    }
    vec3 normal = normalize(vNormal);
    if (!gl_FrontFacing) normal = -normal;
    vec3 lightDirection = normalize(vec3(-0.4, -0.6, 1.0));
    float diffuse = max(dot(normal, lightDirection), 0.0);
    vec3 color = gl_FrontFacing ? vec3(0.12, 0.72, 0.62) : vec3(0.9, 0.47, 0.22);
    outColor = vec4(color * (0.18 + 0.82 * diffuse), 1.0);
}
