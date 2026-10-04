import { createBuffer, requireResource } from "@/src/common/webgl/index.ts";

export class Mesh {
  private readonly vertices: WebGLBuffer;
  private readonly array: WebGLVertexArrayObject;
  private readonly count: number;

  constructor(private readonly gl: WebGL2RenderingContext, data: Float32Array) {
    this.array = requireResource(gl.createVertexArray());
    gl.bindVertexArray(this.array);
    this.vertices = createBuffer(gl, data);
    this.count = data.length / 9;
    for (let location = 0; location < 3; location++) {
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 36, location * 12);
    }
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
