import type { Color, Point } from "@/src/common/graphics/types.ts";

export class VertexBatch {
  private data = new Float32Array(65536);
  private length = 0;

  reset(): void {
    this.length = 0;
  }

  append(point: Point, color: Color): void {
    this.reserve(6);
    this.data.set([point[0], point[1], ...color], this.length);
    this.length += 6;
  }

  view(): Float32Array<ArrayBuffer> {
    return this.data.subarray(0, this.length);
  }

  private reserve(count: number): void {
    if (this.length + count <= this.data.length) return;
    const expanded = new Float32Array(this.data.length * 2);
    expanded.set(this.data);
    this.data = expanded;
  }
}
