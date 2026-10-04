import { createBuffer, requireResource } from "@/src/common/webgl/index.ts";

export class Mesh {
  private readonly buffer: WebGLBuffer;
  private readonly array: WebGLVertexArrayObject;
  private readonly count: number;

  constructor(private readonly gl: WebGL2RenderingContext, program: WebGLProgram, data: Float32Array) {
    this.count = data.length / 12;
    this.array = requireResource(gl.createVertexArray());
    gl.bindVertexArray(this.array);
    this.buffer = createBuffer(gl, data);
    const attributes = [
      ["aPosition", 3, 0], ["aNormal", 3, 12], ["aUV", 2, 24],
      ["aColor", 3, 32], ["aTextured", 1, 44],
    ] as const;
    for (const [name, size, offset] of attributes) {
      const location = gl.getAttribLocation(program, name);
      if (location < 0) throw new Error(`Missing attribute: ${name}`);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 48, offset);
    }
    gl.bindVertexArray(null);
  }

  draw(): void {
    this.gl.bindVertexArray(this.array);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.count);
  }

  dispose(): void {
    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteVertexArray(this.array);
  }
}
