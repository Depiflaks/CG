import { Mesh, type BufferGeometry, type Group } from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { readMaterials } from "./materials.ts";
import { createDefaultMaterial, VERTEX_COMPONENTS, type Material, type ModelPart } from "./types.ts";

async function loadText(url: string, signal: AbortSignal): Promise<string> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Failed to load ${url}: HTTP ${String(response.status)}`);
  return response.text();
}

export async function loadObj(url: string, signal: AbortSignal): Promise<ModelPart[]> {
  try {
    return await loadModelParts(url, signal);
  } catch (error) {
    if (signal.aborted) throw error;
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${url}: ${message}`);
  }
}

function readVertices(geometry: BufferGeometry, start: number, count: number): Float32Array {
  const positions = geometry.getAttribute("position");
  const normals = geometry.getAttribute("normal");
  const uv = geometry.attributes.uv;
  const vertices = new Float32Array(count * VERTEX_COMPONENTS);
  for (let index = 0; index < count; index += 1) {
    const vertex = start + index;
    vertices.set([
      positions.getX(vertex), positions.getY(vertex), positions.getZ(vertex),
      normals.getX(vertex), normals.getY(vertex), normals.getZ(vertex),
      uv?.getX(vertex) ?? 0, uv?.getY(vertex) ?? 0,
    ], index * VERTEX_COMPONENTS);
  }
  if (!vertices.every(Number.isFinite)) throw new Error("OBJ contains invalid vertex data.");
  return vertices;
}

function readMesh(mesh: Mesh, materials: Map<string, Material>): ModelPart[] {
  const { geometry } = mesh;
  const meshMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const groups = geometry.groups.length > 0 ? geometry.groups
    : [{ start: 0, count: geometry.getAttribute("position").count, materialIndex: 0 }];
  return groups.map(({ start, count, materialIndex }) => {
    const name = meshMaterials[materialIndex ?? 0]?.name ?? "";
    const material = materials.get(name);
    if (!material) throw new Error(`Material ${name} not found. Check mtllib and usemtl.`);
    return { name: mesh.name, material, vertices: readVertices(geometry, start, count) };
  });
}

async function loadMaterials(names: string[], url: string, signal: AbortSignal): Promise<Map<string, Material>> {
  const libraries = await Promise.all([...new Set(names)].map(async (name) => {
    const libraryUrl = new URL(name, url).href;
    return readMaterials(await loadText(libraryUrl, signal), libraryUrl);
  }));
  return new Map([["", createDefaultMaterial()], ...libraries.flatMap((library) => [...library])]);
}

async function loadModelParts(url: string, signal: AbortSignal): Promise<ModelPart[]> {
  const object = new OBJLoader().parse(await loadText(url, signal)) as Group & { materialLibraries: string[] };
  const materials = await loadMaterials(object.materialLibraries, url, signal);
  const parts: ModelPart[] = [];
  object.traverse((child) => {
    if (child instanceof Mesh) parts.push(...readMesh(child as Mesh, materials));
  });
  if (parts.length === 0) throw new Error("OBJ contains no polygonal faces.");
  return parts;
}
