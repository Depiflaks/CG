import { createBuffer, requireResource } from "@/src/common/webgl/index.ts";
import { createPlane } from "./geometry.ts";

export class Mesh {
  private readonly vao: WebGLVertexArrayObject;
  private readonly vertices: WebGLBuffer;
  private readonly indices: WebGLBuffer;
  private readonly triangleCount: number;
  private readonly lineCount: number;

  constructor(private readonly gl: WebGL2RenderingContext, program: WebGLProgram) {
    this.vao = requireResource(gl.createVertexArray());
    gl.bindVertexArray(this.vao);
    try {
      this.vertices = createBuffer(gl);
      this.indices = requireResource(gl.createBuffer());
      const plane = createPlane();
      this.triangleCount = plane.triangles.length;
      this.lineCount = plane.lines.length;
      this.upload(program, plane);
    } catch (error) {
      this.dispose();
      throw error;
    } finally {
      gl.bindVertexArray(null);
    }
  }

  draw(wireframe: boolean): void {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    gl.drawElements(wireframe ? gl.LINES : gl.TRIANGLES,
      wireframe ? this.lineCount : this.triangleCount, gl.UNSIGNED_SHORT,
      wireframe ? this.triangleCount * Uint16Array.BYTES_PER_ELEMENT : 0);
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
    const indices = new Uint16Array(this.triangleCount + this.lineCount);
    indices.set(plane.triangles);
    indices.set(plane.lines, this.triangleCount);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  }
}
