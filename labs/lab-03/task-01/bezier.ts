import { Vector2D } from "@/src/common/graphics/Vector2D.ts";

export type ControlPoints = [Vector2D, Vector2D, Vector2D, Vector2D];

export function approximateBezier(
  points: ControlPoints,
  segments = 200,
): Float32Array {
  const vertices = new Float32Array((segments + 1) * 2);
  const [a, b, c, d] = points;

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const u = 1 - t;
    const point = a.scale(u ** 3)
      .add(b.scale(3 * u ** 2 * t))
      .add(c.scale(3 * u * t ** 2))
      .add(d.scale(t ** 3));
    vertices[i * 2] = point.x;
    vertices[i * 2 + 1] = point.y;
  }

  return vertices;
}
