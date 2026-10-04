#version 300 es
in vec3 aPosition;
in vec3 aNormal;
in vec2 aUV;
in vec3 aColor;
in float aTextured;
uniform mat4 uView;
uniform mat4 uProjection;
out vec3 vPosition;
out vec3 vNormal;
out vec2 vUV;
out vec3 vColor;
out float vTextured;

void main() {
    vPosition = aPosition;
    vNormal = aNormal;
    vUV = aUV;
    vColor = aColor;
    vTextured = aTextured;
    gl_Position = uProjection * uView * vec4(aPosition, 1.0);
}
