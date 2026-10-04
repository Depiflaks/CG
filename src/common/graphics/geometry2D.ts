import { Vector2 } from "./vector2.ts";

export function rectangle(x: number, y: number, width: number, height: number): Vector2[] {
  return [new Vector2(x, y), new Vector2(x + width, y),
    new Vector2(x + width, y + height), new Vector2(x, y + height)];
}

export function circlePoints(center: Vector2, radius: number, segments = 32): Vector2[] {
  return Array.from({ length: segments }, (_, index): Vector2 => {
    const angle = index * Math.PI * 2 / segments;
    return center.add(new Vector2(Math.cos(angle), Math.sin(angle)).scale(radius));
  });
}

export function rotate(point: Vector2, center: Vector2, angle: number): Vector2 {
  const { x, y } = point.subtract(center);
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return center.add(new Vector2(x * cosine - y * sine, x * sine + y * cosine));
}

export function orient(points: readonly Vector2[], origin: Vector2, axis: Vector2): Vector2[] {
  return points.map(({ x, y }): Vector2 => origin.add(new Vector2(
    axis.y * x + axis.x * y,
    -axis.x * x + axis.y * y,
  )));
}

export function along(origin: Vector2, axis: Vector2, distance: number): Vector2 {
  return origin.add(axis.scale(distance));
}

export function cross(a: Vector2, b: Vector2, c: Vector2): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
