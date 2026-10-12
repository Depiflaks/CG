import type { Point, Vector3 } from "@/src/common/graphics/types.ts";

const QUAD_TRIANGLE_INDICES = [0, 1, 2, 0, 2, 3] as const;
const QUAD_UVS: readonly [Point, Point, Point, Point] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];
const SIZE_TO_HALF_EXTENT = 2;
const BOX_FACES: readonly {
  points: readonly [Vector3, Vector3, Vector3, Vector3];
  normal: Vector3;
}[] = [
  { points: [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], normal: [0, 0, 1] },
  { points: [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]], normal: [0, 0, -1] },
  { points: [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]], normal: [1, 0, 0] },
  { points: [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]], normal: [-1, 0, 0] },
  { points: [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]], normal: [0, 1, 0] },
  { points: [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]], normal: [0, -1, 0] },
];

export interface Material {
  readonly color: Vector3;
  readonly textured: boolean;
}

export function vertex(
  data: number[],
  point: Vector3,
  normal: Vector3,
  uv: Point,
  material: Material,
): void {
  data.push(
    ...point,
    ...normal,
    ...uv,
    ...material.color,
    Number(material.textured),
  );
}

export function quad(
  data: number[],
  points: readonly [Vector3, Vector3, Vector3, Vector3],
  normal: Vector3,
  material: Material,
): void {
  for (const index of QUAD_TRIANGLE_INDICES) {
    vertex(data, points[index], normal, QUAD_UVS[index], material);
  }
}

export function box(
  data: number[],
  center: Vector3,
  size: Vector3,
  material: Material,
): void {
  const [x, y, z] = center;
  const [w, h, d] = size.map((value) => value / SIZE_TO_HALF_EXTENT) as [number, number, number];
  const p = (dx: number, dy: number, dz: number): Vector3 => [
    x + dx * w,
    y + dy * h,
    z + dz * d,
  ];
  for (const { points, normal } of BOX_FACES) {
    const [a, b, c, d] = points;
    quad(data, [p(...a), p(...b), p(...c), p(...d)], normal, material);
  }
}
