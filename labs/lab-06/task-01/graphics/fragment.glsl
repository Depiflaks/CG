#version 300 es
precision highp float;
in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;
uniform vec3 uEye;
uniform vec3 uAmbient;
uniform vec3 uDiffuse;
uniform vec3 uSpecular;
uniform float uShininess;
uniform sampler2D uTexture;
uniform bool uTextured;
out vec4 outColor;

const vec3 AMBIENT_LIGHT = vec3(0.45);
const vec3 KEY_POSITION = vec3(-2.5, 6.0, 4.0);
const vec3 KEY_COLOR = vec3(0.8, 0.76, 0.68);
const vec3 FILL_DIRECTION = normalize(vec3(2.0, 3.0, -1.0));
const vec3 FILL_COLOR = vec3(0.25, 0.3, 0.4);
const float MIN_SHININESS = 0.001;

vec3 illuminate(vec3 direction, vec3 color, vec3 normal, vec3 base) {
    float diffuse = max(dot(normal, direction), 0.0);
    vec3 view = normalize(uEye - vPosition);
    float highlight = diffuse > 0.0
        ? pow(max(dot(reflect(-direction, normal), view), 0.0), max(uShininess, MIN_SHININESS)) : 0.0;
    return color * (base * diffuse + uSpecular * highlight);
}

void main() {
    vec3 texel = uTextured ? texture(uTexture, vUV).rgb : vec3(1.0);
    vec3 normal = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
    vec3 color = AMBIENT_LIGHT * uAmbient * texel;
    color += illuminate(normalize(KEY_POSITION - vPosition), KEY_COLOR, normal, uDiffuse * texel);
    color += illuminate(FILL_DIRECTION, FILL_COLOR, normal, uDiffuse * texel);
    outColor = vec4(color, 1.0);
}
