#version 300 es
in vec3 aPosition;
in vec3 aNormal;
in vec3 aColor;
uniform mat4 uView;
uniform mat4 uProjection;
out vec3 vPosition;
flat out vec3 vNormal;
flat out vec3 vColor;

void main() {
    vPosition = aPosition;
    vNormal = aNormal;
    vColor = aColor;
    gl_Position = uProjection * uView * vec4(aPosition, 1.0);
}
