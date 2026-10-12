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
    vec2 uv = vUV;
    vec3 surface = texture(uSurface, vec3(uv, vMaterial)).rgb;
    if (vMaterial == 7.0) {
        outColor = vec4(surface, 1.0);
        return;
    }
    vec3 light = uEye - vPosition;
    float distanceToEye = length(light);
    float diffuse = max(dot(normalize(vNormal), normalize(light)), 0.0);
    float brightness = 0.3 + 0.7 * diffuse /
                (1.0 + 0.035 * distanceToEye * distanceToEye);
    float fog = clamp((distanceToEye - 2.0) / 10.0, 0.0, 1.0);
    vec3 color = mix(
            surface * brightness,
            vec3(0.65, 0.76, 0.86),
            fog
        );
    outColor = vec4(color, 1.0);
}
