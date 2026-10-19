#version 300 es
precision highp float;
precision highp int;

struct Hit {
    float distance;
    vec3 normal;
};

uniform vec2 uResolution;
uniform vec3 uEye;
uniform vec3 uTarget;
uniform vec3 uUp;
uniform vec3 uLight;
uniform mat4 uModel;
out vec4 outColor;

const float EPSILON = 0.0001;
const float FAR = 10000.0;

float validRoot(vec3 origin, vec3 direction, float distance) {
    if (distance <= EPSILON || distance >= FAR) return FAR;
    vec2 point = origin.xy + distance * direction.xy;
    return all(lessThanEqual(abs(point), vec2(1.0))) ? distance : FAR;
}

float surfaceDistance(vec3 origin, vec3 direction) {
    float a = direction.x * direction.x - direction.y * direction.y;
    float b = 2.0 * (origin.x * direction.x - origin.y * direction.y) - direction.z;
    float c = origin.x * origin.x - origin.y * origin.y - origin.z;
    if (abs(a) < 1e-10) {
        return abs(b) < 1e-10 ? FAR : validRoot(origin, direction, -c / b);
    }
    float discriminant = b * b - 4.0 * a * c;
    if (discriminant < 0.0) return FAR;
    float root = sqrt(discriminant);
    float q = -0.5 * (b + (b >= 0.0 ? root : -root));
    if (abs(q) < 1e-10) return validRoot(origin, direction, -b / (2.0 * a));
    return min(validRoot(origin, direction, q / a), validRoot(origin, direction, c / q));
}

Hit trace(vec3 origin, vec3 direction) {
    mat3 inverseRotation = transpose(mat3(uModel));
    vec3 localOrigin = inverseRotation * origin;
    vec3 localDirection = inverseRotation * direction;
    float distance = surfaceDistance(localOrigin, localDirection);
    if (distance >= FAR) return Hit(FAR, vec3(0.0));
    vec3 point = localOrigin + distance * localDirection;
    vec3 normal = normalize(mat3(uModel) * vec3(2.0 * point.x, -2.0 * point.y, -1.0));
    if (dot(normal, direction) > 0.0) normal = -normal;
    return Hit(distance, normal);
}

float visibility(vec3 point, vec3 normal) {
    vec3 origin = point + normal * EPSILON * 4.0;
    vec3 delta = uLight - origin;
    float distance = length(delta);
    return trace(origin, delta / distance).distance >= distance - EPSILON ? 1.0 : 0.0;
}

vec3 shade(Hit hit, vec3 direction) {
    vec3 point = uEye + direction * hit.distance;
    vec3 lightDirection = normalize(uLight - point);
    vec3 color = vec3(0.04, 0.36, 0.75);
    float lambert = max(dot(hit.normal, lightDirection), 0.0);
    if (lambert <= 0.0) return color * 0.16;
    vec3 reflected = reflect(-lightDirection, hit.normal);
    float phong = pow(max(dot(reflected, -direction), 0.0), 80.0);
    vec3 direct = color * lambert * 0.8 + vec3(0.65) * phong;
    return color * 0.16 + direct * visibility(point, hit.normal);
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
    if (hit.distance < FAR) color = shade(hit, direction);
    outColor = vec4(pow(clamp(color, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
}
