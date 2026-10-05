import { createBuffer, requireResource } from "@/src/common/webgl/index.ts";

export class VertexBuffer {
  private readonly buffer: WebGLBuffer;
  private readonly array: WebGLVertexArrayObject;
  private readonly count: number;

  constructor(
    private readonly gl: WebGL2RenderingContext,
    program: WebGLProgram,
    data: Float32Array,
  ) {
    this.buffer = createBuffer(gl, data);
    this.array = requireResource(gl.createVertexArray());
    this.count = data.length / 9;
    gl.bindVertexArray(this.array);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    ["aPosition", "aNormal", "aColor"].forEach((name, index) => {
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 36, index * 12);
    });
    gl.bindVertexArray(null);
  }

  draw(mode: number): void {
    this.gl.bindVertexArray(this.array);
    this.gl.drawArrays(mode, 0, this.count);
  }

  dispose(): void {
    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteVertexArray(this.array);
  }
}
