import { rotationMatrix } from "./matrices.ts";

export class ObjectRotation {
  yaw = 0;
  pitch = 0;

  rotate(dx: number, dy: number): void {
    this.yaw += dx * 0.008;
    this.pitch += dy * 0.008;
  }

  reset(): void {
    this.yaw = 0;
    this.pitch = 0;
  }

  modelMatrix(): Float32Array {
    return rotationMatrix(this.yaw, this.pitch);
  }
}
