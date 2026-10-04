import type { Vector3 } from "@/src/common/graphics/types.ts";
import { at } from "@/src/common/collections/index.ts";
import { cross, dot, normalize, scale, subtract } from "@/src/common/graphics/vector3.ts";

function neighbors(vertices: readonly Vector3[], origin: Vector3): number[] {
  const distances = vertices.map((vertex) => Math.hypot(...subtract(vertex, origin)));
  const edge = Math.min(...distances.filter((distance) => distance > 1e-7));
  return distances.flatMap((distance, index) => Math.abs(distance - edge) < 1e-7 ? [index] : []);
}

function supportingFace(vertices: readonly Vector3[], a: number, b: number, c: number): number[] {
  const origin = at(vertices, a);
  const normal = normalize(cross(subtract(at(vertices, b), origin), subtract(at(vertices, c), origin)));
  const distances = vertices.map((vertex) => dot(normal, subtract(vertex, origin)));
  if (Math.min(...distances) < -1e-7 && Math.max(...distances) > 1e-7) return [];
  return distances.flatMap((distance, index) => Math.abs(distance) < 1e-7 ? [index] : []);
}

export function faceNormal(vertices: readonly Vector3[], indices: readonly number[]): Vector3 {
  const a = at(vertices, at(indices, 0));
  const b = at(vertices, at(indices, 1));
  const c = at(vertices, at(indices, 2));
  const normal = normalize(cross(subtract(b, a), subtract(c, a)));
  return dot(normal, a) > 0 ? normal : scale(normal, -1);
}

function orderFace(vertices: readonly Vector3[], indices: readonly number[]): number[] {
  const normal = faceNormal(vertices, indices);
  const center = scale(normal, dot(normal, at(vertices, at(indices, 0))));
  const tangent = normalize(subtract(at(vertices, at(indices, 0)), center));
  const bitangent = cross(normal, tangent);
  const angle = (index: number): number => {
    const offset = subtract(at(vertices, index), center);
    return Math.atan2(dot(offset, bitangent), dot(offset, tangent));
  };
  return [...indices].sort((a, b) => angle(a) - angle(b));
}

function collectFaces(vertices: readonly Vector3[], origin: number, faces: Map<string, number[]>): void {
  const adjacent = neighbors(vertices, at(vertices, origin));
  adjacent.forEach((a, index) => {
    for (const b of adjacent.slice(index + 1)) {
      const face = supportingFace(vertices, origin, a, b);
      if (face.length >= 3) faces.set(face.join(","), face);
    }
  });
}

export function createFaces(vertices: readonly Vector3[]): number[][] {
  const faces = new Map<string, number[]>();
  vertices.forEach((_, index) => { collectFaces(vertices, index, faces); });
  return [...faces.values()].map((indices) => orderFace(vertices, indices));
}
