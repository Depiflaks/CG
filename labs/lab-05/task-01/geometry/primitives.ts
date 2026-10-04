import type { Point, Vector3 } from "@/src/common/graphics/types.ts";

export interface Material {
  readonly color: Vector3;
  readonly textured: boolean;
}

export function vertex(data: number[], point: Vector3, normal: Vector3, uv: Point, material: Material): void {
  data.push(...point, ...normal, ...uv, ...material.color, Number(material.textured));
}

export function quad(data: number[], points: readonly [Vector3, Vector3, Vector3, Vector3],
  normal: Vector3, material: Material): void {
  const uvs: readonly [Point, Point, Point, Point] = [[0, 0], [1, 0], [1, 1], [0, 1]];
  for (const index of [0, 1, 2, 0, 2, 3] as const) {
    vertex(data, points[index], normal, uvs[index], material);
  }
}

export function box(data: number[], center: Vector3, size: Vector3, material: Material): void {
  const [x, y, z] = center;
  const [w, h, d] = size.map((value) => value / 2) as [number, number, number];
  const p = (dx: number, dy: number, dz: number): Vector3 => [x + dx * w, y + dy * h, z + dz * d];
  quad(data, [p(-1, -1, 1), p(1, -1, 1), p(1, 1, 1), p(-1, 1, 1)], [0, 0, 1], material);
  quad(data, [p(1, -1, -1), p(-1, -1, -1), p(-1, 1, -1), p(1, 1, -1)], [0, 0, -1], material);
  quad(data, [p(1, -1, 1), p(1, -1, -1), p(1, 1, -1), p(1, 1, 1)], [1, 0, 0], material);
  quad(data, [p(-1, -1, -1), p(-1, -1, 1), p(-1, 1, 1), p(-1, 1, -1)], [-1, 0, 0], material);
  quad(data, [p(-1, 1, 1), p(1, 1, 1), p(1, 1, -1), p(-1, 1, -1)], [0, 1, 0], material);
  quad(data, [p(-1, -1, -1), p(1, -1, -1), p(1, -1, 1), p(-1, -1, 1)], [0, -1, 0], material);
}
