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
    const cx = Math.cos(this.pitch);
    const sx = Math.sin(this.pitch);

    return new Float32Array([
      cy,       0,   -sy,       0,
      sy * sx,  cx,   cy * sx,  0,
      sy * cx, -sx,   cy * cx,  0,
      0,        0,    0,        1,
    ]);
  }
}
