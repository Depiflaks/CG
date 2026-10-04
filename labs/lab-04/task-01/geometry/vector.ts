import type { Vector3 } from "./types.ts";

export function subtract(a: Vector3, b: Vector3): Vector3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function dot(a: Vector3, b: Vector3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function cross(a: Vector3, b: Vector3): Vector3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

export function scale(vector: Vector3, factor: number): Vector3 {
  return [vector[0] * factor, vector[1] * factor, vector[2] * factor];
}

export function normalize(vector: Vector3): Vector3 {
  return scale(vector, 1 / Math.hypot(...vector));
}

export function at<T>(values: readonly T[], index: number): T {
  const value = values[index];
  if (value === undefined) throw new Error("Некорректный индекс геометрии.");
  return value;
}
