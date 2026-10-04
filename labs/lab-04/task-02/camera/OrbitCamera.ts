import type { Vector3 } from "@/src/common/graphics/types.ts";

export class OrbitCamera {
  private yaw = 0.65;
  private pitch = 0.48;
  private distance = 6;

  get eye(): Vector3 {
    const radius = this.distance * Math.cos(this.pitch);
    return [radius * Math.sin(this.yaw), this.distance * Math.sin(this.pitch), radius * Math.cos(this.yaw)];
  }

  rotate(dx: number, dy: number): void {
    this.yaw -= dx * 0.008;
    this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch + dy * 0.008));
  }

  zoom(delta: number): void {
    this.distance = Math.max(3.6, Math.min(12, this.distance * Math.exp(delta * 0.001)));
  }
}
