#version 300 es
precision highp float;
in vec3 vPosition;
in vec3 vNormal;
uniform vec3 uEye;
out vec4 outColor;

vec3 illuminate() {
    vec3 normal = normalize(gl_FrontFacing ? vNormal : -vNormal);
    vec3 light = normalize(vec3(3.0, 5.0, 4.0) - vPosition);
    vec3 fill = normalize(vec3(-4.0, 1.0, -3.0) - vPosition);
    vec3 view = normalize(uEye - vPosition);
    float diffuse = max(dot(normal, light), 0.0);
    float secondary = max(dot(normal, fill), 0.0);
    float specular = diffuse > 0.0 ? pow(max(dot(reflect(-light, normal), view), 0.0), 40.0) : 0.0;
    return vec3(0.12, 0.58, 0.66) * (0.25 + 0.65 * diffuse + 0.25 * secondary) + vec3(0.35 * specular);
}

void main() {
    outColor = vec4(illuminate(), 1.0);
}
