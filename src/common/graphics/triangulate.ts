import { cross } from "./geometry2D.ts";
import { at } from "@/src/common/collections/index.ts";
import type { Point } from "./types.ts";

function winding(points: readonly Point[]): number {
  const area = points.reduce((sum, point, index) => {
    const next = at(points, (index + 1) % points.length);
    return sum + point[0] * next[1] - next[0] * point[1];
  }, 0);
  return Math.sign(area);
}

function contains(point: Point, a: Point, b: Point, c: Point, sign: number): boolean {
  return cross(a, b, point) * sign >= -0.0001
    && cross(b, c, point) * sign >= -0.0001
    && cross(c, a, point) * sign >= -0.0001;
}

function isEar(points: readonly Point[], indices: number[], index: number, sign: number): boolean {
  const previous = at(indices, (index + indices.length - 1) % indices.length);
  const current = at(indices, index);
  const next = at(indices, (index + 1) % indices.length);
  const a = at(points, previous);
  const b = at(points, current);
  const c = at(points, next);
  if (cross(a, b, c) * sign <= 0.0001) return false;
  return indices.every((candidate) => {
    if (candidate === previous || candidate === current || candidate === next) return true;
    return !contains(at(points, candidate), a, b, c, sign);
  });
}

export function triangulate(points: readonly Point[]): number[] {
  const indices = points.map((_, index) => index);
  const triangles: number[] = [];
  const sign = winding(points);
  while (indices.length > 3) {
    const ear = indices.findIndex((_, index) => isEar(points, indices, index, sign));
    if (ear < 0) throw new Error("Unable to triangulate the contour.");
    triangles.push(at(indices, (ear + indices.length - 1) % indices.length),
      at(indices, ear), at(indices, (ear + 1) % indices.length));
    indices.splice(ear, 1);
  }
  return [...triangles, ...indices];
}
