#version 300 es
precision highp float;
precision highp int;

struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};

struct Light {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float radius;
};

struct Hit {
    float distance;
    vec3 normal;
    int material;
};

uniform vec2 uResolution;
uniform vec3 uEye;
uniform vec3 uTarget;
uniform int uShadows;
uniform int uSamples;
uniform Light uLight;
uniform Material uMaterials[4];
out vec4 outColor;

const float EPSILON = 0.001;
const float FAR = 10000.0;
const vec4 SPHERES[3] = vec4[3](
    vec4(-1.35, 1.0, 0.0, 1.0),
    vec4(1.15, 0.75, 0.4, 0.75),
    vec4(0.2, 0.55, -1.65, 0.55)
);

float sphereDistance(vec3 origin, vec3 direction, vec4 sphere) {
    vec3 offset = origin - sphere.xyz;
    float b = dot(offset, direction);
    float c = dot(offset, offset) - sphere.w * sphere.w;
    float discriminant = b * b - c;
    if (discriminant < 0.0) return FAR;
    float root = sqrt(discriminant);
    float near = -b - root;
    float far = -b + root;
    if (near > EPSILON) return near;
    return far > EPSILON ? far : FAR;
}

Hit trace(vec3 origin, vec3 direction) {
    Hit hit = Hit(FAR, vec3(0.0), -1);
    for (int i = 0; i < 3; ++i) {
        float distance = sphereDistance(origin, direction, SPHERES[i]);
        if (distance >= hit.distance) continue;
        hit = Hit(distance, normalize(origin + direction * distance - SPHERES[i].xyz), i);
    }
    if (abs(direction.y) < 0.00001) return hit;
    float plane = -origin.y / direction.y;
    if (plane > EPSILON && plane < hit.distance) {
        hit = Hit(plane, vec3(0.0, 1.0, 0.0), 3);
    }
    return hit;
}

bool visible(vec3 origin, vec3 lightPoint) {
    vec3 delta = lightPoint - origin;
    float distance = length(delta);
    if (distance < EPSILON) return true;
    return trace(origin, delta / distance).distance >= distance - EPSILON;
}

vec3 lightSample(int index, int count) {
    float radius = uLight.radius * sqrt((float(index) + 0.5) / float(count));
    float angle = float(index) * 2.39996323;
    return uLight.position + vec3(cos(angle), 0.0, sin(angle)) * radius;
}

float visibility(vec3 point, vec3 normal) {
    if (uShadows == 0) return 1.0;
    vec3 origin = point + normal * EPSILON * 4.0;
    if (uShadows == 1 || uLight.radius == 0.0) {
        return visible(origin, uLight.position) ? 1.0 : 0.0;
    }
    float reached = 0.0;
    for (int i = 0; i < 64; ++i) {
        if (i >= uSamples) break;
        reached += visible(origin, lightSample(i, uSamples)) ? 1.0 : 0.0;
    }
    return reached / float(uSamples);
}

Material surfaceMaterial(Hit hit, vec3 point) {
    Material material = uMaterials[hit.material];
    if (hit.material != 3) return material;
    float checker = mod(floor(point.x) + floor(point.z), 2.0);
    float shade = mix(0.5, 1.0, checker);
    material.diffuse *= shade;
    material.ambient *= shade;
    return material;
}

vec3 directLight(Material material, vec3 point, vec3 normal) {
    vec3 lightDirection = normalize(uLight.position - point);
    float lambert = max(dot(normal, lightDirection), 0.0);
    if (lambert <= 0.0) return vec3(0.0);
    vec3 viewDirection = normalize(uEye - point);
    vec3 reflected = reflect(-lightDirection, normal);
    float phong = pow(max(dot(reflected, viewDirection), 0.0), material.shininess);
    vec3 diffuse = material.diffuse * uLight.diffuse * lambert;
    vec3 specular = material.specular * uLight.specular * phong;
    return (diffuse + specular) * visibility(point, normal);
}

float emitterDistance(vec3 origin, vec3 direction) {
    if (abs(direction.y) < 0.00001) return FAR;
    float distance = (uLight.position.y - origin.y) / direction.y;
    if (distance <= EPSILON) return FAR;
    vec3 offset = origin + distance * direction - uLight.position;
    float radius = uShadows == 2 ? max(0.08, uLight.radius) : 0.08;
    return length(offset.xz) <= radius ? distance : FAR;
}

vec3 rayDirection() {
    vec2 screen = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;
    vec3 forward = normalize(uTarget - uEye);
    vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
    vec3 up = cross(right, forward);
    return normalize(forward * 2.2 + screen.x * right + screen.y * up);
}

void main() {
    vec3 direction = rayDirection();
    Hit hit = trace(uEye, direction);
    vec3 color = vec3(0.018, 0.028, 0.045);
    if (hit.material >= 0) {
        vec3 point = uEye + direction * hit.distance;
        Material material = surfaceMaterial(hit, point);
        color = material.ambient * uLight.ambient;
        color += directLight(material, point, hit.normal);
    }
    if (emitterDistance(uEye, direction) < hit.distance) color = uLight.diffuse;
    outColor = vec4(pow(clamp(color, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
}
