import type { Vector3 } from "@/src/common/graphics/types.ts";
import { BLOCK_SIZE, DIRECTIONS, MAZE_SIZE, Maze, WALL_HEIGHT } from "../Maze.ts";

export const FLOOR_MATERIAL = 6;
export const SKY_MATERIAL = 7;

const WALL_CORNERS: readonly (readonly Vector3[])[] = [
  [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]],
  [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]],
  [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]],
  [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]],
];
const WALL_UV = [[0, 0], [0, 1.4], [1, 1.4], [1, 0]] as const;
const SHADOW_UV = [[0, 0], [0, 1], [1, 1], [1, 0]] as const;

export function wallMaterial(x: number, z: number): number {
  return (Math.floor(x / 3) + Math.floor(z / 3) * 3) % 6;
}

function quad(data: number[], corners: readonly Vector3[], normal: Vector3, material: number): void {
  for (const index of [0, 1, 2, 0, 2, 3]) {
    const point = corners[index];
    const uv = normal[1] === 0 ? WALL_UV[index] : SHADOW_UV[index];
    const shadow = SHADOW_UV[index];
    if (point === undefined || uv === undefined || shadow === undefined) throw new Error("Missing vertex.");
    data.push(...point, ...normal, ...uv, ...shadow, material);
  }
}

function horizontal(data: number[], x: number, z: number, height: number, material: number): void {
  const corners: Vector3[] = [[x, height, z], [x, height, z + BLOCK_SIZE],
    [x + BLOCK_SIZE, height, z + BLOCK_SIZE], [x + BLOCK_SIZE, height, z]];
  quad(data, corners, [0, 1, 0], material);
}

function walls(data: number[], maze: Maze, x: number, z: number): void {
  DIRECTIONS.forEach(([dx, dz], index) => {
    if (maze.isOpen(x + dx, z + dz)) return;
    const corners = WALL_CORNERS[index];
    if (corners === undefined) throw new Error("Missing wall vertices.");
    const points = corners.map(([px, py, pz]): Vector3 =>
      [(x + px) * BLOCK_SIZE, py * WALL_HEIGHT, (z + pz) * BLOCK_SIZE]);
    quad(data, points.reverse(), [-dx, 0, -dz], wallMaterial(x + dx, z + dz));
  });
}

function cellGeometry(data: number[], maze: Maze, x: number, z: number): void {
  const open = maze.isOpen(x, z);
  horizontal(data, x * BLOCK_SIZE, z * BLOCK_SIZE, open ? 0 : WALL_HEIGHT,
    open ? FLOOR_MATERIAL : wallMaterial(x, z));
  if (open) walls(data, maze, x, z);
}

export function createGeometry(maze: Maze): Float32Array {
  const data: number[] = [];
  for (let z = 0; z < MAZE_SIZE; z++) {
    for (let x = 0; x < MAZE_SIZE; x++) cellGeometry(data, maze, x, z);
  }
  return new Float32Array(data);
}
