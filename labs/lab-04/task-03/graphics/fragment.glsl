#version 300 es
precision highp float;
precision highp sampler2DArray;
in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;
flat in float vMaterial;
flat in float vPainting;
uniform vec3 uEye;
uniform sampler2DArray uSurface;
uniform sampler2DArray uPaintings;
out vec4 outColor;

vec3 paintSurface(vec3 surface) {
    if (vPainting < 0.0) return surface;
    vec2 uv = (vUV - vec2(0.15, 0.425)) / 0.7;
    if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return surface;
    vec4 painting = texture(uPaintings, vec3(uv.x, 1.0 - uv.y, vPainting));
    return mix(surface, painting.rgb, painting.a);
}

void main() {
    vec2 uv = vUV;
    vec3 surface = texture(uSurface, vec3(uv, vMaterial)).rgb;
    if (vMaterial == 7.0) {
        outColor = vec4(surface, 1.0);
        return;
    }
    surface = paintSurface(surface);
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
