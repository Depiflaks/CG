#version 300 es
precision highp float;
in vec3 vPosition;
flat in vec3 vNormal;
flat in vec3 vColor;
uniform vec3 uEye;
uniform bool uLighting;
uniform float uAlpha;
out vec4 outColor;

vec3 illuminate() {
    vec3 normal = normalize(gl_FrontFacing ? vNormal : -vNormal);
    vec3 light = normalize(vec3(3.0, 4.0, 5.0) - vPosition);
    vec3 view = normalize(uEye - vPosition);
    float diffuse = max(dot(normal, light), 0.0);
    float specular = diffuse > 0.0 ? pow(max(dot(reflect(-light, normal), view), 0.0), 32.0) : 0.0;
    return vColor * (0.28 + 0.72 * diffuse) + vec3(0.22 * specular);
}

void main() {
    outColor = vec4(uLighting ? illuminate() : vColor, uAlpha);
}
