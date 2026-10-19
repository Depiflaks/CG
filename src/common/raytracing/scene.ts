import type { Vector3 } from "@/src/common/graphics/types.ts";

export interface Material {
  readonly ambient: Vector3;
  readonly diffuse: Vector3;
  readonly specular: Vector3;
  readonly shininess: number;
}

export interface Light {
  readonly position: Vector3;
  readonly ambient: Vector3;
  readonly diffuse: Vector3;
  readonly specular: Vector3;
  readonly radius: number;
}

export interface Scene {
  readonly light: Light;
  readonly materials: readonly Material[];
  readonly shadows: "none" | "hard" | "soft";
  readonly samples: number;
}

export function createScene(shadows: boolean): Scene {
  return {
    light: {
      position: [-3, 5, 3], ambient: [0.12, 0.12, 0.15],
      diffuse: [0.8, 0.8, 0.8], specular: [1, 1, 1], radius: 0.8,
    },
    materials: [
      material([0.65, 0.09, 0.035], 80),
      material([0.035, 0.3, 0.65], 160),
      material([0.12, 0.5, 0.18], 24),
      material([0.45, 0.48, 0.54], 32, [0.12, 0.12, 0.12]),
    ],
    shadows: shadows ? "soft" : "none", samples: 32,
  };
}

function material(diffuse: Vector3, shininess: number, specular: Vector3 = [0.8, 0.8, 0.8]): Material {
  return { ambient: diffuse, diffuse, specular, shininess };
}
