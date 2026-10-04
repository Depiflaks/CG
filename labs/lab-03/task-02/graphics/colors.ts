import type { Color } from "./types.ts";

export const colors = {
  background: [0.95, 0.96, 0.97, 1],
  outline: [0.2, 0.25, 0.29, 1],
  metalLight: [0.89, 0.92, 0.94, 1],
  metal: [0.63, 0.69, 0.74, 1],
  cavity: [0.2, 0.25, 0.29, 1],
  brass: [0.85, 0.75, 0.45, 1],
  chamber: [0.9, 0.94, 0.97, 1],
  fire: [1, 0.7, 0.2, 1],
  spark: [1, 0.85, 0.1, 1],
  white: [0.99, 0.99, 0.97, 1],
} as const satisfies Record<string, Color>;
