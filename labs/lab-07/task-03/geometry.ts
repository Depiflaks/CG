const SEGMENTS = 64;
const EXTENT = 1.6;

function createVertices(): Float32Array {
  const vertices = new Float32Array((SEGMENTS + 1) ** 2 * 3);
  for (let row = 0; row <= SEGMENTS; row += 1) {
    for (let column = 0; column <= SEGMENTS; column += 1) {
      const offset = (row * (SEGMENTS + 1) + column) * 3;
      vertices[offset] = EXTENT * (2 * column / SEGMENTS - 1);
      vertices[offset + 1] = EXTENT * (2 * row / SEGMENTS - 1);
    }
  }
  return vertices;
}

function createIndices(): Uint16Array {
  const triangles: number[] = [];
  for (let row = 0; row < SEGMENTS; row += 1) {
    for (let column = 0; column < SEGMENTS; column += 1) {
      const a = row * (SEGMENTS + 1) + column;
      const b = a + 1;
      const c = a + SEGMENTS + 1;
      const d = c + 1;
      triangles.push(a, b, c, b, d, c);
    }
  }
  return new Uint16Array(triangles);
}

export function createPlane() {
  return { vertices: createVertices(), triangles: createIndices() };
}
