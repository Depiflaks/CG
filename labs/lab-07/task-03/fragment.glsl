#version 300 es
precision highp float;

in vec3 vNormal;
out vec4 outColor;

void main() {
    vec3 normal = normalize(vNormal);
    if (!gl_FrontFacing) normal = -normal;
    vec3 lightDirection = normalize(vec3(-0.4, -0.6, 1.0));
    float diffuse = max(dot(normal, lightDirection), 0.0);
    vec3 color = vec3(0.12, 0.72, 0.62);
    outColor = vec4(color * (0.18 + 0.82 * diffuse), 1.0);
}
