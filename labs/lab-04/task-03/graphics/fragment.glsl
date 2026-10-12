#version 300 es
precision highp float;
precision highp sampler2DArray;
in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;
flat in float vMaterial;
uniform vec3 uEye;
uniform sampler2DArray uSurface;
out vec4 outColor;

void main() {
    vec2 uv = vMaterial > 6.5 ? vec2(vUV.x, clamp(vUV.y, 0.002, 0.998)) : vUV;
    vec3 surface = texture(uSurface, vec3(uv, vMaterial)).rgb;
    if (vMaterial > 6.5) {
        outColor = vec4(surface, 1.0);
        return;
    }
    vec3 normal = normalize(vNormal);
    vec3 light = normalize(vec3(-0.45, 0.85, 0.3));
    float brightness = 0.4 + 0.6 * max(dot(normal, light), 0.0);
    float wallShade = mix(0.45, 1.0, smoothstep(0.0, 1.8, vPosition.y));
    float shadow = abs(normal.y) < 0.5 ? wallShade : 1.0;
    float distanceToEye = length(uEye - vPosition);
    float fog = smoothstep(2.0, 12.0, distanceToEye);
    vec3 color = mix(surface * brightness * shadow, vec3(0.65, 0.76, 0.86), fog);
    outColor = vec4(color, 1.0);
}
