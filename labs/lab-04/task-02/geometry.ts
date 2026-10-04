import { normalize } from "@/src/common/graphics/vector3.ts";

const extent = 1.4;
const subdivisions = 96;
const stride = subdivisions + 1;

export interface SurfaceMesh {
  readonly vertices: Float32Array;
  readonly triangles: Uint16Array;
}

function vertex(column: number, row: number): number[] {
  const x = extent * (2 * column / subdivisions - 1);
  const y = extent * (2 * row / subdivisions - 1);
  const z = (x * x - y * y) / extent;
  const normal = normalize([-2 * x / extent, 1, -2 * y / extent]);
  return [x, z, -y, ...normal];
}

function triangleIndices(): Uint16Array {
  const indices: number[] = [];
  for (let row = 0; row < subdivisions; row++) {
    for (let column = 0; column < subdivisions; column++) {
      const a = row * stride + column;
      const b = a + 1;
      const c = a + stride;
      indices.push(a, b, c, b, c + 1, c);
    }
  }
  return new Uint16Array(indices);
}

export function createSurface(): SurfaceMesh {
  const vertices: number[] = [];
  for (let row = 0; row <= subdivisions; row++) {
    for (let column = 0; column <= subdivisions; column++) {
      vertices.push(...vertex(column, row));
    }
  }
  return { vertices: new Float32Array(vertices), triangles: triangleIndices() };
}
