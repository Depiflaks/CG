import type { Polyhedron } from "../geometry/types.ts";
import { at } from "@/src/common/collections/index.ts";

export function faceVertices(polyhedron: Polyhedron): Float32Array {
  const data: number[] = [];
  for (const face of polyhedron.faces) {
    for (let index = 1; index < face.indices.length - 1; index++) {
      const triangle = [at(face.indices, 0), at(face.indices, index), at(face.indices, index + 1)];
      triangle.forEach((vertex) => { data.push(...at(polyhedron.vertices, vertex), ...face.normal, ...face.color); });
    }
  }
  return new Float32Array(data);
}

export function edgeVertices(polyhedron: Polyhedron): Float32Array {
  const data: number[] = [];
  polyhedron.edges.forEach((edge) => {
    edge.forEach((vertex) => { data.push(...at(polyhedron.vertices, vertex), 0, 0, 0, 0, 0, 0); });
  });
  return new Float32Array(data);
}
