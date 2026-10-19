#version 300 es
precision highp float;

uniform sampler2D uFirst;
uniform sampler2D uSecond;
uniform vec2 uImageAspects;
uniform vec2 uResolution;
uniform vec2 uOrigin;
uniform float uProgress;
uniform float uSource;

in vec2 vUv;
out vec4 outColor;

vec2 imageUv(vec2 uv, float aspect) {
    float viewportAspect = uResolution.x / uResolution.y;
    vec2 crop = vec2(min(viewportAspect / aspect, 1.0), min(aspect / viewportAspect, 1.0));
    return clamp((uv - 0.5) * crop + 0.5, 0.0, 1.0);
}

vec3 transitionColor(vec2 uv, float reveal) {
    vec3 first = texture(uFirst, imageUv(uv, uImageAspects.x)).rgb;
    vec3 second = texture(uSecond, imageUv(uv, uImageAspects.y)).rgb;
    return mix(first, second, mix(reveal, 1.0 - reveal, uSource));
}

void main() {
    if (uProgress <= 0.0 || uProgress >= 1.0) {
        outColor = vec4(transitionColor(vUv, step(1.0, uProgress)), 1.0);
        return;
    }
    vec2 scale = uResolution / min(uResolution.x, uResolution.y);
    vec2 delta = (vUv - uOrigin) * scale;
    float distance = length(delta);
    float farthest = length(max(uOrigin, 1.0 - uOrigin) * scale);
    float front = mix(-0.02, farthest + 0.52, uProgress);
    float behind = front - distance;
    float envelope = smoothstep(0.0, 0.07, behind) * (1.0 - smoothstep(0.07, 0.5, behind));
    envelope *= smoothstep(0.0, 0.06, uProgress) / (1.0 + 0.25 * distance);
    float phase = behind * 75.0;
    vec2 direction = delta / max(distance, 0.0001);
    vec2 offset = direction / scale * sin(phase) * envelope * 0.025;
    float reveal = smoothstep(0.02, 0.48, behind);
    vec3 color = transitionColor(vUv + offset, reveal);
    float brightness = 1.0 + cos(phase) * envelope * 0.28;
    outColor = vec4(color * brightness + vec3(0.035) * envelope, 1.0);
}
