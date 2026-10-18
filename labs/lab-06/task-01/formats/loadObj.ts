import { parseObj } from "./obj.ts";
import { parseMtl } from "./mtl.ts";
import { createDefaultMaterial, DEFAULT_MATERIAL_NAME, type ModelPart } from "./types.ts";

async function loadText(url: string, signal: AbortSignal): Promise<string> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Не удалось загрузить ${url}: HTTP ${String(response.status)}`);
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

async function loadModelParts(url: string, signal: AbortSignal): Promise<ModelPart[]> {
  const document = parseObj(await loadText(url, signal));
  const libraries = await Promise.all(document.libraries.map(async (name) => {
    const libraryUrl = new URL(name, url).href;
    return parseMtl(await loadText(libraryUrl, signal), libraryUrl);
  }));
  const materials = new Map(libraries.flatMap((library) => [...library]));
  if (!materials.has(DEFAULT_MATERIAL_NAME)) materials.set(DEFAULT_MATERIAL_NAME, createDefaultMaterial());
  return document.parts.map((part) => {
    const material = materials.get(part.material);
    if (!material) throw new Error(`Не найден материал ${part.material}. Проверьте mtllib и usemtl.`);
    return { vertices: part.vertices, material };
  });
}
