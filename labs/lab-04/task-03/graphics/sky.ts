import type { Vector3 } from "@/src/common/graphics/types.ts";
import { SKY_MATERIAL } from "./geometry.ts";

const SEGMENTS = 48;
const RINGS = 24;

function point(u: number, v: number): Vector3 {
  const azimuth = u * Math.PI * 2;
  const altitude = v * Math.PI;
  return [80 * Math.sin(altitude) * Math.cos(azimuth),
    80 * Math.cos(altitude), 80 * Math.sin(altitude) * Math.sin(azimuth)];
}

function skyQuad(data: number[], column: number, row: number): void {
  const corners = [[column, row], [column + 1, row],
    [column + 1, row + 1], [column, row + 1]] as const;
  for (const index of [0, 1, 2, 0, 2, 3]) {
    const corner = corners[index];
    if (corner === undefined) throw new Error("Missing sky vertex.");
    const u = corner[0] / SEGMENTS;
    const v = corner[1] / RINGS;
    data.push(...point(u, v), 0, 0, 0, u, v, SKY_MATERIAL, -1);
  }
}

export function createSkyGeometry(): Float32Array {
  const data: number[] = [];
  for (let row = 0; row < RINGS; row++) {
    for (let column = 0; column < SEGMENTS; column++) skyQuad(data, column, row);
  }
  return new Float32Array(data);
}
