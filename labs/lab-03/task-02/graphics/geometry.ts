import type { Point } from "./types.ts";

export function rectangle(x: number, y: number, width: number, height: number): Point[] {
  return [[x, y], [x + width, y], [x + width, y + height], [x, y + height]];
}

export function circlePoints(center: Point, radius: number, segments = 32): Point[] {
  return Array.from({ length: segments }, (_, index): Point => {
    const angle = index * Math.PI * 2 / segments;
    return [center[0] + Math.cos(angle) * radius, center[1] + Math.sin(angle) * radius];
  });
}

export function rotate(point: Point, center: Point, angle: number): Point {
  const x = point[0] - center[0];
  const y = point[1] - center[1];
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return [center[0] + x * cosine - y * sine, center[1] + x * sine + y * cosine];
}

export function orient(points: readonly Point[], origin: Point, axis: Point): Point[] {
  return points.map(([x, y]): Point => [
    origin[0] + axis[1] * x + axis[0] * y,
    origin[1] - axis[0] * x + axis[1] * y,
  ]);
}

export function along(origin: Point, axis: Point, distance: number): Point {
  return [origin[0] + axis[0] * distance, origin[1] + axis[1] * distance];
}

export function cross(a: Point, b: Point, c: Point): number {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}
