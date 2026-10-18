#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUV;
layout(location = 3) in float aMaterial;
layout(location = 4) in float aPainting;
uniform mat4 uView;
uniform mat4 uProjection;
uniform vec3 uEye;
out vec3 vPosition;
out vec3 vNormal;
out vec2 vUV;
flat out float vMaterial;
flat out float vPainting;

void main() {
    vPosition = aPosition + (aMaterial > 6.5 ? uEye : vec3(0.0));
    vNormal = aNormal;
    vUV = aUV;
    vMaterial = aMaterial;
    vPainting = aPainting;
    gl_Position = uProjection * uView * vec4(vPosition, 1.0);
}
