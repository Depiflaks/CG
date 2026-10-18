import type { Point, Vector3 } from "@/src/common/graphics/types.ts";
import { cross, normalize, subtract } from "@/src/common/graphics/vector3.ts";
import { Vector2 } from "@/src/common/graphics/vector2.ts";
import { triangulate } from "@/src/common/graphics/triangulate.ts";
import { at } from "@/src/common/collections/index.ts";
import { parseNumber } from "./records.ts";

const TRIANGLE_VERTICES = 3;
const DEFAULT_UV: Point = [0, 0];

export interface VertexTables {
  positions: Vector3[];
  normals: Vector3[];
  coordinates: Point[];
}

interface FaceVertex {
  position: Vector3;
  normal?: Vector3;
  uv: Point;
}

function resolveIndex<T>(value: string, table: readonly T[]): T {
  const index = parseNumber(value);
  const resolved = index < 0 ? table.length + index : index - 1;
  const item = table[resolved];
  if (!Number.isInteger(index) || index === 0 || item === undefined) {
    throw new Error(`Индекс ${value} выходит за границы таблицы (${String(table.length)}).`);
  }
  return item;
}

function parseFaceVertex(token: string, tables: VertexTables): FaceVertex {
  const indices = token.split("/");
  const [position, coordinate, normal] = indices;
  if (!position || indices.length > TRIANGLE_VERTICES) throw new Error(`Некорректная вершина: ${token}`);
  return {
    position: resolveIndex(position, tables.positions),
    uv: coordinate ? resolveIndex(coordinate, tables.coordinates) : DEFAULT_UV,
    normal: normal ? resolveIndex(normal, tables.normals) : undefined,
  };
}

function calculateFaceNormal(vertices: readonly FaceVertex[]): Vector3 {
  const sum: [number, number, number] = [0, 0, 0];
  vertices.forEach(({ position: a }, index) => {
    const b = at(vertices, (index + 1) % vertices.length).position;
    sum[0] += (a[1] - b[1]) * (a[2] + b[2]);
    sum[1] += (a[2] - b[2]) * (a[0] + b[0]);
    sum[2] += (a[0] - b[0]) * (a[1] + b[1]);
  });
  if (Math.hypot(...sum) === 0) throw new Error("Вырожденная грань.");
  return normalize(sum);
}

function projectFace(vertices: readonly FaceVertex[], normal: Vector3): Vector2[] {
  const dominant = normal.map(Math.abs).indexOf(Math.max(...normal.map(Math.abs)));
  const horizontal = (dominant + 1) % TRIANGLE_VERTICES;
  const vertical = (dominant + 2) % TRIANGLE_VERTICES;
  const points = vertices.map(({ position }) => new Vector2(at(position, horizontal), at(position, vertical)));
  const minX = Math.min(...points.map(({ x }) => x));
  const minY = Math.min(...points.map(({ y }) => y));
  const extent = Math.max(Math.max(...points.map(({ x }) => x)) - minX,
    Math.max(...points.map(({ y }) => y)) - minY);
  const origin = new Vector2(minX, minY);
  return points.map((point) => point.subtract(origin).scale(1 / extent));
}

function appendTriangle(output: number[], vertices: FaceVertex[], indices: number[]): void {
  const a = at(vertices, at(indices, 0));
  const b = at(vertices, at(indices, 1));
  const c = at(vertices, at(indices, 2));
  const normal = normalize(cross(subtract(b.position, a.position), subtract(c.position, a.position)));
  for (const vertex of [a, b, c]) {
    output.push(...vertex.position, ...(vertex.normal ?? normal), ...vertex.uv);
  }
}

export function appendFace(output: number[], tokens: string[], tables: VertexTables): void {
  if (tokens.length < TRIANGLE_VERTICES) throw new Error("Грань должна содержать не менее трёх вершин.");
  const vertices = tokens.map((token) => parseFaceVertex(token, tables));
  const normal = calculateFaceNormal(vertices);
  const indices = tokens.length === TRIANGLE_VERTICES
    ? [0, 1, 2] : triangulate(projectFace(vertices, normal));
  for (let offset = 0; offset < indices.length; offset += TRIANGLE_VERTICES) {
    appendTriangle(output, vertices, indices.slice(offset, offset + TRIANGLE_VERTICES));
  }
}
