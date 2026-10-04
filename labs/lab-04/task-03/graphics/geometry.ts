import type { Vector3 } from "@/src/common/graphics/types.ts";
import { BLOCK_SIZE, DIRECTIONS, MAZE_SIZE, Maze, WALL_HEIGHT } from "../Maze.ts";

const WALL_COLOR: Vector3 = [0.75, 0.43, 0.23];
const FLOOR_COLOR: Vector3 = [0.22, 0.48, 0.39];
const CEILING_COLOR: Vector3 = [0.35, 0.43, 0.64];
const WALL_CORNERS: readonly (readonly Vector3[])[] = [
  [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]],
  [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]],
  [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]],
  [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]],
];

function quad(data: number[], corners: readonly Vector3[], normal: Vector3, color: Vector3): void {
  for (const index of [0, 1, 2, 0, 2, 3]) {
    const point = corners[index];
    if (point === undefined) throw new Error("Missing quad vertex.");
    data.push(...point, ...normal, ...color);
  }
}

function horizontal(data: number[], x: number, z: number, ceiling: boolean): void {
  const y = ceiling ? WALL_HEIGHT : 0;
  const corners: Vector3[] = [[x, y, z], [x, y, z + BLOCK_SIZE],
    [x + BLOCK_SIZE, y, z + BLOCK_SIZE], [x + BLOCK_SIZE, y, z]];
  if (ceiling) corners.reverse();
  quad(data, corners, [0, ceiling ? -1 : 1, 0], ceiling ? CEILING_COLOR : FLOOR_COLOR);
}

function walls(data: number[], maze: Maze, x: number, z: number): void {
  DIRECTIONS.forEach(([dx, dz], index) => {
    if (maze.isOpen(x + dx, z + dz)) return;
    const corners = WALL_CORNERS[index];
    if (corners === undefined) throw new Error("Missing wall vertices.");
    const points = corners.map(([px, py, pz]): Vector3 =>
      [(x + px) * BLOCK_SIZE, py * WALL_HEIGHT, (z + pz) * BLOCK_SIZE]);
    quad(data, points.reverse(), [-dx, 0, -dz], WALL_COLOR);
  });
}

export function createGeometry(maze: Maze): Float32Array {
  const data: number[] = [];
  for (let z = 0; z < MAZE_SIZE; z++) {
    for (let x = 0; x < MAZE_SIZE; x++) {
      if (!maze.isOpen(x, z)) continue;
      horizontal(data, x * BLOCK_SIZE, z * BLOCK_SIZE, false);
      horizontal(data, x * BLOCK_SIZE, z * BLOCK_SIZE, true);
      walls(data, maze, x, z);
    }
  }
  return new Float32Array(data);
}
