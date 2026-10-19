import { createBuffer, requireResource } from "@/src/common/webgl/index.ts";
import { createPlane } from "./geometry.ts";

export class Mesh {
  private readonly vao: WebGLVertexArrayObject;
  private readonly vertices: WebGLBuffer;
  private readonly indices: WebGLBuffer;
  private readonly triangleCount: number;

  constructor(private readonly gl: WebGL2RenderingContext, program: WebGLProgram) {
    this.vao = requireResource(gl.createVertexArray());
    gl.bindVertexArray(this.vao);
    try {
      this.vertices = createBuffer(gl);
      this.indices = requireResource(gl.createBuffer());
      const plane = createPlane();
      this.triangleCount = plane.triangles.length;
      this.upload(program, plane);
    } catch (error) {
      this.dispose();
      throw error;
    } finally {
      gl.bindVertexArray(null);
    }
  }

  draw(): void {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.triangleCount, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }

  dispose(): void {
    this.gl.deleteBuffer(this.vertices);
    this.gl.deleteBuffer(this.indices);
    this.gl.deleteVertexArray(this.vao);
  }

  private upload(program: WebGLProgram, plane: ReturnType<typeof createPlane>): void {
    const gl = this.gl;
    gl.bufferData(gl.ARRAY_BUFFER, plane.vertices, gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, plane.triangles, gl.STATIC_DRAW);
  }
}
