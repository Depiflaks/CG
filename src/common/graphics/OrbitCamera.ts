import type { Vector3 } from "@/src/common/graphics/types.ts";

interface OrbitCameraOptions {
  target?: Vector3;
  yaw?: number;
  pitch?: number;
  distance?: number;
  minDistance?: number;
  maxDistance?: number;
}

export class OrbitCamera {
  readonly target: Vector3;
  private yaw: number;
  private pitch: number;
  private distance: number;
  private readonly minDistance: number;
  private readonly maxDistance: number;

  constructor(options: OrbitCameraOptions = {}) {
    this.target = options.target ?? [0, 0, 0];
    this.yaw = options.yaw ?? 0.65;
    this.pitch = options.pitch ?? 0.48;
    this.distance = options.distance ?? 6;
    this.minDistance = options.minDistance ?? 3.6;
    this.maxDistance = options.maxDistance ?? 12;
  }

  get eye(): Vector3 {
    const radius = this.distance * Math.cos(this.pitch);
    return [
      this.target[0] + radius * Math.sin(this.yaw),
      this.target[1] + this.distance * Math.sin(this.pitch),
      this.target[2] + radius * Math.cos(this.yaw),
    ];
  }

  rotate(dx: number, dy: number): void {
    this.yaw -= dx * 0.008;
    this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch + dy * 0.008));
  }

  zoom(delta: number): void {
    this.distance = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, this.distance * Math.exp(delta * 0.001)),
    );
  }
}
