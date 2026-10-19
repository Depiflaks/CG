#version 300 es
precision highp float;

in vec2 point;
out vec4 outColor;

vec2 starVertex(int index) {
    float angle = 1.5707963 + float(index) * 0.6283185;
    float radius = index % 2 == 0 ? 0.7 : 0.7 * 0.382;
    return radius * vec2(cos(angle), sin(angle));
}

void main() {
    bool inside = false;
    vec2 previous = starVertex(9);

    for (int i = 0; i < 10; i++) {
        vec2 current = starVertex(i);
        if ((current.y > point.y) != (previous.y > point.y)) {
            float edgeX = current.x + (point.y - current.y)
                * (previous.x - current.x) / (previous.y - current.y);
            if (point.x < edgeX) inside = !inside;
        }
        previous = current;
    }

    vec3 color = inside ? vec3(0.85, 0.08, 0.08) : vec3(1.0, 0.95, 0.8);
    outColor = vec4(color, 1.0);
}
