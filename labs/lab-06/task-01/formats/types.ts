import type { Vector3 } from "@/src/common/graphics/types.ts";

export const POSITION_COMPONENTS = 3;
export const TEXTURE_COMPONENTS = 2;
export const VERTEX_COMPONENTS = POSITION_COMPONENTS * 2 + TEXTURE_COMPONENTS;

export interface Material {
  ambient: Vector3;
  diffuse: Vector3;
  specular: Vector3;
  shininess: number;
  diffuseMap?: string;
}

export function createDefaultMaterial(): Material {
  return {
    ambient: [0.2, 0.2, 0.2],
    diffuse: [0.7, 0.7, 0.7],
    specular: [0.2, 0.2, 0.2],
    shininess: 32,
  };
}

export interface ModelPart {
  name: string;
  material: Material;
  vertices: Float32Array;
  rotation?: { pivot: Vector3; speed: number };
}
