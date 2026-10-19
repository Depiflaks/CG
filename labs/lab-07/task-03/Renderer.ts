import { projectionMatrix, viewMatrix } from "@/src/common/graphics/matrices.ts";
import type { Vector3 } from "@/src/common/graphics/types.ts";
import { createProgram, requireResource } from "@/src/common/webgl/index.ts";
import { Mesh } from "./Mesh.ts";
import vertexSource from "./vertex.glsl?raw";
import fragmentSource from "./fragment.glsl?raw";

export class Renderer {
  private readonly program: WebGLProgram;
  private readonly mesh: Mesh;
  private readonly view: WebGLUniformLocation;
  private readonly projection: WebGLUniformLocation;
  private readonly morph: WebGLUniformLocation;
  private readonly wireframe: WebGLUniformLocation;

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.program = createProgram(gl, vertexSource, fragmentSource);
    try {
      this.view = this.uniform("uView");
      this.projection = this.uniform("uProjection");
      this.morph = this.uniform("uMorph");
      this.wireframe = this.uniform("uWireframe");
      this.mesh = new Mesh(gl, this.program);
    } catch (error) {
      gl.deleteProgram(this.program);
      throw error;
    }
    gl.clearColor(0.04, 0.06, 0.08, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
  }

  draw(eye: Vector3, amount: number, wireframe: boolean): void {
    const gl = this.gl;
    if (gl.isContextLost()) return;
    const aspect = gl.canvas.width / gl.canvas.height;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.view, false, viewMatrix(eye, [0, 0, 0.35], [0, 0, 1]));
    gl.uniformMatrix4fv(this.projection, false,
      projectionMatrix(aspect, 2.2 * Math.min(1, aspect)));
    gl.uniform1f(this.morph, amount);
    gl.uniform1i(this.wireframe, wireframe ? 1 : 0);
    this.mesh.draw(wireframe);
  }

  dispose(): void {
    this.mesh.dispose();
    this.gl.deleteProgram(this.program);
  }

  private uniform(name: string): WebGLUniformLocation {
    return requireResource(this.gl.getUniformLocation(this.program, name));
  }
}
