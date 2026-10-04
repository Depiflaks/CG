import type { Point, Vector3 } from "@/src/common/graphics/types.ts";
import { quad, vertex, type Material } from "./primitives.ts";

function outline(width: number, depth: number, inset: number): Point[] {
  const points: Point[] = [[-width + 0.12, -depth], [width - 0.12, -depth],
    [width, -depth + 0.12], [width, depth - 0.12], [width - 0.12, depth]];
  for (let i = 1; i <= 32; i++) {
    const x = (width - 0.12) * (1 - 2 * i / 32);
    const curve = Math.max(0, 1 - (x / (width * 0.65)) ** 2);
    points.push([x, depth - inset * curve ** 2]);
  }
  points.push([-width, depth - 0.12], [-width, -depth + 0.12]);
  return points;
}

function cap(data: number[], a: Point, b: Point, y: number, normal: Vector3, material: Material): void {
  for (const [x, z] of [[0, 0], a, b] as const) {
    vertex(data, [x, y, z], normal, [x / 3.6 + 0.5, z / 1.8 + 0.5], material);
  }
}

export function desktop(data: number[], y: number, width: number, depth: number,
  inset: number, material: Material): void {
  const points = outline(width, depth, inset);
  points.forEach((a, i) => {
    const b = points[(i + 1) % points.length];
    if (b === undefined) return;
    cap(data, b, a, y + 0.045, [0, 1, 0], material);
    cap(data, a, b, y - 0.045, [0, -1, 0], material);
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const length = Math.hypot(dx, dz);
    quad(data, [[a[0], y - 0.045, a[1]], [a[0], y + 0.045, a[1]],
      [b[0], y + 0.045, b[1]], [b[0], y - 0.045, b[1]]], [dz / length, 0, -dx / length], material);
  });
}
