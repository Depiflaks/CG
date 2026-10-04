#version 300 es
precision highp float;
in vec3 vPosition;
in vec3 vNormal;
in vec3 vColor;
uniform vec3 uEye;
out vec4 outColor;

void main() {
    vec3 light = uEye - vPosition;
    float distanceToEye = length(light);
    float diffuse = max(dot(normalize(vNormal), normalize(light)), 0.0);
    float brightness = 0.3 + 0.7 * diffuse / (1.0 + 0.035 * distanceToEye * distanceToEye);
    float fog = 1.0 - exp(-0.025 * distanceToEye);
    vec3 color = mix(vColor * brightness, vec3(0.04, 0.05, 0.07), fog);
    outColor = vec4(color, 1.0);
}
