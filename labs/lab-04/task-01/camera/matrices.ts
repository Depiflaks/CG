import type { Vector3 } from "../geometry/types.ts";
import { cross, dot, normalize } from "../geometry/vector.ts";

export function viewMatrix(eye: Vector3): Float32Array {
  const z = normalize(eye);
  const x = normalize(cross([0, 1, 0], z));
  const y = cross(z, x);
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
  ]);
}

export function projectionMatrix(aspect: number): Float32Array {
  const focal = 2.4 * Math.min(1, aspect);
  const near = 0.1;
  const far = 100;
  return new Float32Array([
    focal / aspect, 0, 0, 0,
    0, focal, 0, 0,
    0, 0, (far + near) / (near - far), -1,
    0, 0, 2 * far * near / (near - far), 0,
  ]);
}
