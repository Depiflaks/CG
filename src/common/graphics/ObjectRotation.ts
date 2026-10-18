import type { Vector3 } from "./types.ts";

const ROTATION_SENSITIVITY = 0.008;
const ORIGIN: Vector3 = [0, 0, 0];
const AXIS_COUNT = 3;
const MATRIX_COLUMN_SIZE = 4;
const TRANSLATION_OFFSET = AXIS_COUNT * MATRIX_COLUMN_SIZE;

export class ObjectRotation {
  yaw = 0;
  pitch = 0;

  rotate(dx: number, dy: number): void {
    this.yaw += dx * ROTATION_SENSITIVITY;
    this.pitch += dy * ROTATION_SENSITIVITY;
  }

  reset(): void {
    this.yaw = 0;
    this.pitch = 0;
  }

  modelMatrix(center: Vector3 = ORIGIN, scale = 1): Float32Array {
    const cy = Math.cos(this.yaw);
    const sy = Math.sin(this.yaw);
    const cp = Math.cos(this.pitch);
    const sp = Math.sin(this.pitch);

    const model = new Float32Array([
      cy, sy * sp, -sy * cp, 0,
      0, cp, sp, 0,
      sy, -cy * sp, cy * cp, 0,
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
