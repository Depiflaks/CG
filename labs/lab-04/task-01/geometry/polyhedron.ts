import { colorFaces } from "./coloring.ts";
import { createFaces, faceNormal } from "./faces.ts";
import type { Polyhedron } from "./types.ts";
import { at } from "./vector.ts";
import { createVertices } from "./vertices.ts";

function createEdges(faces: readonly (readonly number[])[]): [number, number][] {
  const edges = new Map<string, [number, number]>();
  faces.forEach((face) => {
    face.forEach((a, index) => {
      const b = at(face, (index + 1) % face.length);
      const edge: [number, number] = a < b ? [a, b] : [b, a];
      edges.set(edge.join(","), edge);
    });
  });
  return [...edges.values()];
}

export function createPolyhedron(): Polyhedron {
  const vertices = createVertices();
  const indices = createFaces(vertices);
  const colors = colorFaces(indices);
  const faces = indices.map((face, index) => ({
    indices: face, normal: faceNormal(vertices, face), color: at(colors, index),
  }));
  return { vertices, faces, edges: createEdges(indices) };
}
