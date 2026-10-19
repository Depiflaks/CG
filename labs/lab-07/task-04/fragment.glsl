#version 300 es
precision highp float;

uniform sampler2D uFirst;
uniform sampler2D uSecond;
uniform vec2 uImageAspects;
uniform vec2 uResolution;
uniform vec2 uOrigin;
uniform float uProgress;
uniform float uSource;

in vec2 vPosition;
out vec4 outColor;

vec2 imageUv(vec2 position, float aspect) {
    float viewportAspect = uResolution.x / uResolution.y;
    vec2 crop = vec2(min(viewportAspect / aspect, 1.0), min(aspect / viewportAspect, 1.0));
    return clamp(position * crop, -1.0, 1.0) * 0.5 + 0.5;
}

vec3 transitionColor(vec2 position, float reveal) {
    vec3 first = texture(uFirst, imageUv(position, uImageAspects.x)).rgb;
    vec3 second = texture(uSecond, imageUv(position, uImageAspects.y)).rgb;
    return mix(first, second, mix(reveal, 1.0 - reveal, uSource));
}

void main() {
    if (uProgress <= 0.0 || uProgress >= 1.0) {
        outColor = vec4(transitionColor(vPosition, step(1.0, uProgress)), 1.0);
        return;
    }
    vec2 scale = uResolution / min(uResolution.x, uResolution.y);
    vec2 delta = (vPosition - uOrigin) * scale;
    float distance = length(delta);
    float farthest = length((1.0 + abs(uOrigin)) * scale);
    float front = mix(0.0, farthest + 1.0, uProgress);
    float behind = front - distance;
    float envelope = smoothstep(0.0, 0.14, behind) * (1.0 - smoothstep(0.14, 1.0, behind));
    envelope *= smoothstep(0.0, 0.06, uProgress) / (1.0 + 0.125 * distance);
    float phase = behind * 37.5;
    vec2 direction = delta / max(distance, 0.0001);
    vec2 offset = direction / scale * sin(phase) * envelope * 0.05;
    float reveal = smoothstep(0.04, 0.96, behind);
    vec3 color = transitionColor(vPosition + offset, reveal);
    float brightness = 1.0 + cos(phase) * envelope * 0.28;
    outColor = vec4(color * brightness, 1.0);
}
