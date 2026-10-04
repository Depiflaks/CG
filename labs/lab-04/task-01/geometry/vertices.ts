import type { Vector3 } from "@/src/common/graphics/types.ts";
import { normalize } from "@/src/common/graphics/vector3.ts";

function seeds(): Vector3[] {
  const phi = (1 + Math.sqrt(5)) / 2;
  const delta = Math.sqrt(phi - 5 / 27);
  const x = Math.cbrt((phi + delta) / 2) + Math.cbrt((phi - delta) / 2);
  const a = phi * Math.sqrt(3 - x * x) / 2;
  const b = phi * Math.sqrt((x - 1 - 1 / x) * phi) / 2;
  const c = phi * Math.sqrt(1 - x + (1 + phi) / x) / 2;
  return [
    [b, x * a, phi * Math.sqrt(x * (x + phi) + 1) / 2],
    [x * x * a, -x * b, phi * phi * Math.sqrt(x * (x + phi) + 1) / (2 * x)],
    [a, x * c, phi * Math.sqrt(x * x + x) / 2],
    [x * x * b, phi * Math.sqrt(x + 1 - phi) / 2, Math.sqrt(x * x * (1 + 2 * phi) - phi) / 2],
    [Math.sqrt((x + 2) * phi + 2) / 2, -c, x * Math.sqrt(x * (1 + phi) - phi) / 2],
  ];
}

function rotations([x, y, z]: Vector3): Vector3[] {
  const signs: Vector3[] = [[1, 1, 1], [1, -1, -1], [-1, -1, 1], [-1, 1, -1]];
  return signs.flatMap(([sx, sy, sz]): Vector3[] => [
    [sx * x, sy * y, sz * z],
    [sz * z, sx * x, sy * y],
    [sy * y, sz * z, sx * x],
  ]);
}

export function createVertices(): Vector3[] {
  return seeds().flatMap(rotations).map(normalize);
}
