import type { Point, Vector3 } from "@/src/common/graphics/types.ts";
import { quad, vertex, type Material } from "./primitives.ts";

const CORNER_BEVEL = 0.12;
const CURVE_SEGMENTS = 32;
const CURVE_SPAN = 2;
const CURVE_WIDTH_RATIO = 0.65;
const CURVE_POWER = 2;
const HALF_THICKNESS = 0.045;
const TEXTURE_WIDTH = 3.6;
const TEXTURE_DEPTH = 1.8;
const TEXTURE_CENTER = 0.5;

function outline(width: number, depth: number, inset: number): Point[] {
  const points: Point[] = [
    [-width + CORNER_BEVEL, -depth],
    [width - CORNER_BEVEL, -depth],
    [width, -depth + CORNER_BEVEL],
    [width, depth - CORNER_BEVEL],
    [width - CORNER_BEVEL, depth],
  ];
  for (let i = 1; i <= CURVE_SEGMENTS; i++) {
    const x = (width - CORNER_BEVEL) * (1 - (CURVE_SPAN * i) / CURVE_SEGMENTS);
    const curve = Math.max(0, 1 - (x / (width * CURVE_WIDTH_RATIO)) ** CURVE_POWER);
    points.push([x, depth - inset * curve ** CURVE_POWER]);
  }
  points.push([-width, depth - CORNER_BEVEL], [-width, -depth + CORNER_BEVEL]);
  return points;
}

function cap(
  data: number[],
  a: Point,
  b: Point,
  y: number,
  normal: Vector3,
  material: Material,
): void {
  for (const [x, z] of [[0, 0], a, b] as const) {
    vertex(data, [x, y, z], normal, [x / TEXTURE_WIDTH + TEXTURE_CENTER, z / TEXTURE_DEPTH + TEXTURE_CENTER], material);
  }
}

export function desktop(
  data: number[],
  y: number,
  width: number,
  depth: number,
  inset: number,
  material: Material,
): void {
  const points = outline(width, depth+0.5, inset+0.5);
  points.forEach((a, i) => {
    const b = points[(i + 1) % points.length];
    if (b === undefined) return;
    cap(data, b, a, y + HALF_THICKNESS, [0, 1, 0], material);
    cap(data, a, b, y - HALF_THICKNESS, [0, -1, 0], material);
    const dx = b[0] - a[0],
      dz = b[1] - a[1];
    const length = Math.hypot(dx, dz);
    quad(
      data,
      [
        [a[0], y - HALF_THICKNESS, a[1]],
        [a[0], y + HALF_THICKNESS, a[1]],
        [b[0], y + HALF_THICKNESS, b[1]],
        [b[0], y - HALF_THICKNESS, b[1]],
      ],
      [dz / length, 0, -dx / length],
      material,
    );
  });
}
