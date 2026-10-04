import type { Color } from "@/src/common/graphics/types.ts";
import type { Vector2 } from "@/src/common/graphics/vector2.ts";

export class VertexBatch {
  private data = new Float32Array(65536);
  private length = 0;

  reset(): void {
    this.length = 0;
  }

  append(point: Vector2, color: Color): void {
    this.reserve(6);
    this.data.set([point.x, point.y, ...color], this.length);
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
