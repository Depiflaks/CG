import { MTLLoader, type MaterialInfo } from "three/addons/loaders/MTLLoader.js";
import type { Vector3 } from "@/src/common/graphics/types.ts";
import { createDefaultMaterial, type Material } from "./types.ts";

interface MaterialColors extends Omit<MaterialInfo, "ns"> {
  ka?: number[];
  ns?: number | string;
}

function color(values: number[] | undefined, fallback: Vector3): Vector3 {
  return [values?.[0] ?? fallback[0], values?.[1] ?? fallback[1], values?.[2] ?? fallback[2]];
}

function convertMaterial(info: MaterialColors, library: MTLLoader.MaterialCreator, url: string): Material {
  const fallback = createDefaultMaterial();
  const material: Material = {
    ambient: color(info.ka, fallback.ambient),
    diffuse: color(info.kd, fallback.diffuse),
    specular: color(info.ks, fallback.specular),
    shininess: Math.max(0, Math.min(1000, Number(info.ns ?? fallback.shininess))),
  };
  if (info.map_kd) {
    const texture = library.getTextureParams(info.map_kd, {});
    material.diffuseMap = new URL(texture.url, url).href;
  }
  return material;
}

export function readMaterials(source: string, url: string): Map<string, Material> {
  const library = new MTLLoader().parse(source, new URL(".", url).href);
  return new Map(Object.entries(library.materialsInfo)
    .map(([name, info]) => [name, convertMaterial(info, library, url)]));
}
