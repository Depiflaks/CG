#version 300 es
layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec4 aColor;
uniform vec2 uViewport;
uniform vec2 uSceneSize;
flat out vec4 vColor;

void main() {
    vec2 position = (aPosition - uSceneSize * 0.5) / uViewport * 2.0;
    gl_Position = vec4(position.x, -position.y, 0.0, 1.0);
    vColor = aColor;
}
