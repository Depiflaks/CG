#version 300 es
in vec3 aPosition;
in vec3 aNormal;
uniform mat4 uView;
uniform mat4 uProjection;
out vec3 vPosition;
out vec3 vNormal;

void main() {
    vPosition = aPosition;
    vNormal = aNormal;
    gl_Position = uProjection * uView * vec4(aPosition, 1.0);
}
