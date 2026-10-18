import { createBuffer, requireResource } from "@/src/common/webgl/index.ts";

export class Mesh {
  private readonly vertices: WebGLBuffer;
  private readonly array: WebGLVertexArrayObject;
  private readonly count: number;

  constructor(private readonly gl: WebGL2RenderingContext, data: Float32Array) {
    this.array = requireResource(gl.createVertexArray());
    gl.bindVertexArray(this.array);
    this.vertices = createBuffer(gl, data);
    this.count = data.length / 10;
    const attributes = [[3, 0], [3, 3], [2, 6], [1, 8], [1, 9]] as const;
    attributes.forEach(([size, offset], location) => {
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 40, offset * 4);
    });
    gl.bindVertexArray(null);
  }

  draw(): void {
    this.gl.bindVertexArray(this.array);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.count);
    this.gl.bindVertexArray(null);
  }

  dispose(): void {
    this.gl.deleteBuffer(this.vertices);
    this.gl.deleteVertexArray(this.array);
  }
}
