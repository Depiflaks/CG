export const SEGMENT_COUNT = 2000;

export function createLine(): Float32Array {
  const vertices = new Float32Array((SEGMENT_COUNT + 1) * 3);
  const step = Math.PI / 1000;
  for (let index = 0; index <= SEGMENT_COUNT; index += 1) {
    vertices[index * 3] = index * step;
  }
  return vertices;
}
