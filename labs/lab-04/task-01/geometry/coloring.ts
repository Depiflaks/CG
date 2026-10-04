import type { Vector3 } from "@/src/common/graphics/types.ts";
import { at } from "@/src/common/collections/index.ts";

const palette: readonly Vector3[] = [
  [0.96, 0.38, 0.27], [0.24, 0.65, 0.93], [0.98, 0.77, 0.26],
  [0.40, 0.80, 0.51], [0.72, 0.44, 0.91], [0.96, 0.46, 0.71],
];

function adjacent(a: readonly number[], b: readonly number[]): boolean {
  return a.filter((index) => b.includes(index)).length >= 2;
}

export function colorFaces(faces: readonly (readonly number[])[]): Vector3[] {
  const colors: Vector3[] = [];
  faces.forEach((face, index) => {
    const occupied = faces.slice(0, index).flatMap((other, otherIndex) =>
      adjacent(face, other) ? [at(colors, otherIndex)] : []);
    const color = palette.find((candidate) => !occupied.includes(candidate));
    if (color === undefined) throw new Error("Не удалось раскрасить смежные грани.");
    colors.push(color);
  });
  return colors;
}
