import type { Vector3 } from "../geometry/types.ts";

export class OrbitCamera {
  private yaw = 0.55;
  private pitch = 0.3;
  private distance = 3.8;

  get eye(): Vector3 {
    const radius = this.distance * Math.cos(this.pitch);
    return [radius * Math.sin(this.yaw), this.distance * Math.sin(this.pitch), radius * Math.cos(this.yaw)];
  }

  rotate(dx: number, dy: number): void {
    this.yaw -= dx * 0.008;
    this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch + dy * 0.008));
  }

  zoom(delta: number): void {
    this.distance = Math.max(2.4, Math.min(8, this.distance * Math.exp(delta * 0.001)));
  }

  reset(): void {
    this.yaw = 0.55;
    this.pitch = 0.3;
    this.distance = 3.8;
  }
}
