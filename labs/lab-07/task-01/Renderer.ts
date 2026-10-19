import { createBuffer, createProgram } from "@/src/common/webgl/index.ts";
import { createLine, SEGMENT_COUNT } from "./geometry.ts";
import vertexSource from "./vertex.glsl?raw";
import fragmentSource from "./fragment.glsl?raw";

export class Renderer {
  private readonly program: WebGLProgram;
  private readonly buffer: WebGLBuffer;
  private readonly position: number;

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.program = createProgram(gl, vertexSource, fragmentSource);
    try {
      this.buffer = createBuffer(gl, createLine());
    } catch (error) {
      gl.deleteProgram(this.program);
      throw error;
    }
    this.position = gl.getAttribLocation(this.program, "aPosition");
  }

  draw(): void {
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.04, 0.06, 0.08, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.position);
    gl.vertexAttribPointer(this.position, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINE_STRIP, 0, SEGMENT_COUNT + 1);
  }

  dispose(): void {
    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteProgram(this.program);
  }
}
