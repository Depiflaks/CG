import type { Vector3 } from "@/src/common/graphics/types.ts";

export class OrbitCamera {
  readonly target: Vector3 = [0, 0.9, 0];
  private yaw = 0.5;
  private pitch = 0.38;
  private distance = 6;

  get eye(): Vector3 {
    const radius = this.distance * Math.cos(this.pitch);
    return [radius * Math.sin(this.yaw), this.target[1] + this.distance * Math.sin(this.pitch),
      radius * Math.cos(this.yaw)];
  }

  rotate(dx: number, dy: number): void {
    this.yaw -= dx * 0.008;
    this.pitch = Math.max(0.05, Math.min(1.45, this.pitch + dy * 0.008));
  }

  zoom(delta: number): void {
    this.distance = Math.max(3.4, Math.min(11, this.distance * Math.exp(delta * 0.001)));
  }
}
