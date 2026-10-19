#version 300 es

in vec2 aPosition;
out vec2 point;

void main() {
    point = aPosition;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
