#version 300 es
precision highp float;
precision highp int;

struct Paraboloid {
    vec3 vertex;
    vec3 scale;
    vec3 color;
};

struct Hit {
    float distance;
    vec3 normal;
    int object;
};

uniform vec2 uResolution;
uniform vec3 uEye;
uniform vec3 uTarget;
uniform vec3 uUp;
uniform vec3 uLight;
uniform mat4 uModel;
uniform Paraboloid uParaboloids[3];
out vec4 outColor;

const float EPSILON = 0.0001;
const float FAR = 10000.0;

float sideRoot(vec3 origin, vec3 direction, float distance) {
    if (distance <= EPSILON || distance >= FAR) return FAR;
    float z = origin.z + distance * direction.z;
    return z >= 0.0 && z <= 1.0 ? distance : FAR;
}

float sideDistance(vec3 origin, vec3 direction) {
    float a = dot(direction.xy, direction.xy);
    float b = 2.0 * dot(origin.xy, direction.xy) - direction.z;
    float c = dot(origin.xy, origin.xy) - origin.z;
    if (a < 1e-10) {
        return abs(b) < 1e-10 ? FAR : sideRoot(origin, direction, -c / b);
    }
    float discriminant = b * b - 4.0 * a * c;
    if (discriminant < 0.0) return FAR;
    float root = sqrt(discriminant);
    float q = -0.5 * (b + (b >= 0.0 ? root : -root));
    if (abs(q) < 1e-10) return sideRoot(origin, direction, -b / (2.0 * a));
    return min(sideRoot(origin, direction, q / a), sideRoot(origin, direction, c / q));
}

float capDistance(vec3 origin, vec3 direction) {
    if (abs(direction.z) < 1e-10) return FAR;
    float distance = (1.0 - origin.z) / direction.z;
    if (distance <= EPSILON || distance >= FAR) return FAR;
    vec2 point = origin.xy + distance * direction.xy;
    return dot(point, point) <= 1.0 ? distance : FAR;
}

Hit intersectParaboloid(vec3 origin, vec3 direction, int index) {
    Paraboloid object = uParaboloids[index];
    vec3 localOrigin = (origin - object.vertex) / object.scale;
    vec3 localDirection = direction / object.scale;
    float side = sideDistance(localOrigin, localDirection);
    float cap = capDistance(localOrigin, localDirection);
    float distance = min(side, cap);
    vec3 point = localOrigin + localDirection * distance;
    vec3 normal = cap <= side ? vec3(0.0, 0.0, 1.0) : vec3(2.0 * point.xy, -1.0);
    return Hit(distance, normalize(mat3(uModel) * (normal / object.scale)), index);
}

Hit trace(vec3 origin, vec3 direction) {
    mat3 inverseRotation = transpose(mat3(uModel));
    vec3 localOrigin = inverseRotation * origin;
    vec3 localDirection = inverseRotation * direction;
    Hit hit = Hit(FAR, vec3(0.0), -1);
    for (int i = 0; i < 3; ++i) {
        Hit candidate = intersectParaboloid(localOrigin, localDirection, i);
        if (candidate.distance < hit.distance) hit = candidate;
    }
    return hit;
}

float visibility(vec3 point, vec3 normal) {
    vec3 origin = point + normal * EPSILON * 4.0;
    vec3 delta = uLight - origin;
    float distance = length(delta);
    return trace(origin, delta / distance).distance >= distance - EPSILON ? 1.0 : 0.0;
}

vec3 shade(Hit hit, vec3 direction) {
    vec3 point = uEye + direction * hit.distance;
    vec3 normal = hit.normal;
    vec3 lightDirection = normalize(uLight - point);
    vec3 color = uParaboloids[hit.object].color;
    float lambert = max(dot(normal, lightDirection), 0.0);
    vec3 reflected = reflect(-lightDirection, normal);
    float phong = pow(max(dot(reflected, -direction), 0.0), 80.0);
    vec3 direct = color * lambert * 0.8 + vec3(0.65) * phong;
    if (lambert <= 0.0) return color * 0.16;
    return color * 0.16 + direct * visibility(point, normal);
}

vec3 rayDirection() {
    vec2 screen = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;
    vec3 forward = normalize(uTarget - uEye);
    vec3 right = normalize(cross(forward, uUp));
    vec3 up = cross(right, forward);
    float focal = 2.2 * min(1.0, uResolution.x / uResolution.y);
    return normalize(forward * focal + screen.x * right + screen.y * up);
}

void main() {
    vec3 direction = rayDirection();
    Hit hit = trace(uEye, direction);
    vec3 color = vec3(0.018, 0.028, 0.045);
    if (hit.object >= 0) color = shade(hit, direction);
    outColor = vec4(pow(clamp(color, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
}
