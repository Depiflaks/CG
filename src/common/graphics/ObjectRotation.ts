import type { Vector3 } from "./types.ts";
import { cross, normalize, subtract } from "./vector3.ts";

const ROTATION_SENSITIVITY = 0.008;
const ORIGIN: Vector3 = [0, 0, 0];
const AXIS_COUNT = 3;
const MATRIX_COLUMN_SIZE = 4;
const TRANSLATION_OFFSET = AXIS_COUNT * MATRIX_COLUMN_SIZE;

export class ObjectRotation {
  private orientation: [number, number, number, number] = [0, 0, 0, 1];
  private readonly right: Vector3;
  private readonly up: Vector3;

  constructor(eye: Vector3 = [0, 0, 1], target: Vector3 = ORIGIN, up: Vector3 = [0, 1, 0]) {
    const forward = normalize(subtract(eye, target));
    this.right = normalize(cross(up, forward));
    this.up = cross(forward, this.right);
  }

  rotate(dx: number, dy: number): void {
    const distance = Math.hypot(dx, dy);
    if (distance === 0) return;
    const halfAngle = distance * ROTATION_SENSITIVITY / 2;
    const factor = Math.sin(halfAngle) / distance;
    const axis = this.right.map((value, index) =>
      (value * dy + (this.up[index] ?? 0) * dx) * factor);
    const [ax = 0, ay = 0, az = 0] = axis;
    const aw = Math.cos(halfAngle);
    const [x, y, z, w] = this.orientation;
    this.orientation = [
      aw * x + ax * w + ay * z - az * y,
      aw * y - ax * z + ay * w + az * x,
      aw * z + ax * y - ay * x + az * w,
      aw * w - ax * x - ay * y - az * z,
    ];
    const length = Math.hypot(...this.orientation);
    this.orientation = this.orientation.map((value) => value / length) as typeof this.orientation;
  }

  reset(): void {
    this.orientation = [0, 0, 0, 1];
  }

  modelMatrix(center: Vector3 = ORIGIN, scale = 1): Float32Array {
    const [x, y, z, w] = this.orientation;
    const model = new Float32Array([
      1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 0,
      2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 0,
      2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y), 0,
      0, 0, 0, 1,
    ]);
    for (let index = 0; index < TRANSLATION_OFFSET; index++) model[index] = (model[index] ?? 0) * scale;
    for (let axis = 0; axis < AXIS_COUNT; axis++) {
      const offset = center.reduce((sum, value, column) =>
        sum + (model[column * MATRIX_COLUMN_SIZE + axis] ?? 0) * value, 0);
      model[TRANSLATION_OFFSET + axis] = (center[axis] ?? 0) - offset;
    }
    return model;
  }
}
