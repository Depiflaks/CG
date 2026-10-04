import { createBuffer, requireResource } from "@/src/common/webgl/index.ts";
import type { SurfaceMesh } from "../geometry.ts";

export class Mesh {
  private readonly vertices: WebGLBuffer;
  private readonly triangles: WebGLBuffer;
  private readonly array: WebGLVertexArrayObject;

  constructor(private readonly gl: WebGL2RenderingContext, program: WebGLProgram,
    private readonly surface: SurfaceMesh) {
    this.array = requireResource(gl.createVertexArray());
    gl.bindVertexArray(this.array);
    this.vertices = createBuffer(gl, surface.vertices);
    ["aPosition", "aNormal"].forEach((name, index) => {
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 24, index * 12);
    });
    this.triangles = this.createIndices(surface.triangles);
    gl.bindVertexArray(null);
  }

  draw(): void {
    const gl = this.gl;
    gl.bindVertexArray(this.array);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
    gl.drawElements(gl.TRIANGLES, this.surface.triangles.length, gl.UNSIGNED_SHORT, 0);
  }

  dispose(): void {
    this.gl.deleteBuffer(this.vertices);
    this.gl.deleteBuffer(this.triangles);
    this.gl.deleteVertexArray(this.array);
  }

  private createIndices(data: Uint16Array): WebGLBuffer {
    const buffer = requireResource(this.gl.createBuffer());
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    return buffer;
  }
}
