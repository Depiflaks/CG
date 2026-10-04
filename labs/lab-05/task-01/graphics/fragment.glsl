#version 300 es
precision highp float;
in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;
in vec3 vColor;
in float vTextured;
uniform vec3 uEye;
uniform sampler2D uTexture;
out vec4 outColor;

vec3 light(vec3 position, vec3 color, vec3 normal, vec3 view, vec3 base) {
    vec3 direction = normalize(position - vPosition);
    float diffuse = max(dot(normal, direction), 0.0);
    float shininess = mix(64.0, 24.0, vTextured);
    float specular = diffuse > 0.0
        ? pow(max(dot(normal, normalize(direction + view)), 0.0), shininess) : 0.0;
    return color * (base * diffuse + mix(0.5, 0.12, vTextured) * specular);
}

void main() {
    vec3 base = vColor * mix(vec3(1.0), texture(uTexture, vUV).rgb, vTextured);
    vec3 normal = normalize(vNormal);
    vec3 view = normalize(uEye - vPosition);
    vec3 color = base * 0.25;
    color += light(vec3(-3.0, 6.0, 4.0), vec3(0.85, 0.80, 0.72), normal, view, base);
    color += light(vec3(4.0, 3.0, -3.0), vec3(0.30, 0.35, 0.42), normal, view, base);
    outColor = vec4(color, 1.0);
}
