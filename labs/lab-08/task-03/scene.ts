import type { Vector3 } from "@/src/common/graphics/types.ts";

export interface Paraboloid {
  readonly vertex: Vector3;
  readonly scale: Vector3;
  readonly color: Vector3;
}

export const EYE: Vector3 = [5, -8, 4.5];
export const TARGET: Vector3 = [0, 0, 0];
export const UP: Vector3 = [0, 0, 1];
export const LIGHT: Vector3 = [-3, -4, 6];

export const PARABOLOIDS: readonly Paraboloid[] = [
  { vertex: [0, 0, -1.75], scale: [1.6, 1.25, 1.4], color: [0.8, 0.19, 0.055] },
  { vertex: [0, 0, -0.35], scale: [1.2, 0.95, 1.2], color: [0.04, 0.36, 0.75] },
  { vertex: [0, 0, 0.85], scale: [0.85, 0.65, 0.9], color: [0.12, 0.6, 0.24] },
];
