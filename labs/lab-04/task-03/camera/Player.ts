import type { Vector3 } from "@/src/common/graphics/types.ts";
import { BLOCK_SIZE, Maze } from "../Maze.ts";

const PLAYER_RADIUS = 0.25;
const MOVE_SPEED = 3;
const TURN_SPEED = 1.8;

export class Player {
  private x = BLOCK_SIZE * 1.5;
  private z = BLOCK_SIZE * 1.5;
  private yaw: number;

  constructor(private readonly maze: Maze) {
    this.yaw = maze.isOpen(2, 1) ? Math.PI / 2 : Math.PI;
  }

  get eye(): Vector3 {
    return [this.x, 1.65, this.z];
  }

  get target(): Vector3 {
    return [this.x + Math.sin(this.yaw), 1.65, this.z - Math.cos(this.yaw)];
  }

  update(forward: number, sideways: number, turn: number, seconds: number): void {
    this.yaw = (this.yaw + turn * TURN_SPEED * seconds) % (Math.PI * 2);
    const length = Math.hypot(forward, sideways);
    if (length === 0) return;
    const distance = MOVE_SPEED * seconds / length;
    const dx = (Math.sin(this.yaw) * forward + Math.cos(this.yaw) * sideways) * distance;
    const dz = (-Math.cos(this.yaw) * forward + Math.sin(this.yaw) * sideways) * distance;
    this.move(dx, dz);
  }

  private move(dx: number, dz: number): void {
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / (PLAYER_RADIUS / 2)));
    for (let step = 0; step < steps; step++) {
      const nextX = this.x + dx / steps;
      if (this.maze.canOccupy(nextX, this.z, PLAYER_RADIUS)) this.x = nextX;
      const nextZ = this.z + dz / steps;
      if (this.maze.canOccupy(this.x, nextZ, PLAYER_RADIUS)) this.z = nextZ;
    }
  }
}
