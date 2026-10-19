import { createBuffer, createProgram } from "@/src/common/webgl/index.ts";
import vertexSource from "./vertex.glsl?raw";
import fragmentSource from "./fragment.glsl?raw";

export class Renderer {
  private readonly program: WebGLProgram;
  private readonly buffer: WebGLBuffer;
  private readonly position: number;

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.program = createProgram(gl, vertexSource, fragmentSource);
    try {
      this.buffer = createBuffer(gl, new Float32Array([
        -0.9, -0.85, 0.9, -0.85, -0.9, 0.85, 0.9, 0.85,
      ]));
    } catch (error) {
      gl.deleteProgram(this.program);
      throw error;
    }
    this.position = gl.getAttribLocation(this.program, "aPosition");
  }

  draw(): void {
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.08, 0.08, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.position);
    gl.vertexAttribPointer(this.position, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  dispose(): void {
    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteProgram(this.program);
  }
}
