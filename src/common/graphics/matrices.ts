import type { Vector3 } from "./types.ts";
import { cross, dot, normalize, subtract } from "./vector3.ts";

export function viewMatrix(eye: Vector3, target: Vector3 = [0, 0, 0], up: Vector3 = [0, 1, 0]): Float32Array {
  const z = normalize(subtract(eye, target));
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
  ]);
}

export function projectionMatrix(aspect: number, focal = 2.4, near = 0.1, far = 100): Float32Array {
  return new Float32Array([
    focal / aspect, 0, 0, 0,
    0, focal, 0, 0,
    0, 0, (far + near) / (near - far), -1,
    0, 0, 2 * far * near / (near - far), 0,
  ]);
}
