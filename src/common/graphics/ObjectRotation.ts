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
    const cy = Math.cos(this.yaw);
    const sy = Math.sin(this.yaw);
    const cp = Math.cos(this.pitch);
    const sp = Math.sin(this.pitch);

    return new Float32Array([
      cy, sy * sp, -sy * cp, 0,
      0, cp, sp, 0,
      sy, -cy * sp, cy * cp, 0,
      0, 0, 0, 1,
    ]);
  }
}
