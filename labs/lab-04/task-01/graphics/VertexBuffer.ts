import { required } from "./program.ts";

export class VertexBuffer {
  private readonly buffer: WebGLBuffer;
  private readonly array: WebGLVertexArrayObject;
  private readonly count: number;

  constructor(private readonly gl: WebGL2RenderingContext, program: WebGLProgram, data: Float32Array) {
    this.buffer = required(gl.createBuffer());
    this.array = required(gl.createVertexArray());
    this.count = data.length / 9;
    gl.bindVertexArray(this.array);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
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
