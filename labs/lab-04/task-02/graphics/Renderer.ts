import { projectionMatrix, viewMatrix } from "@/src/common/graphics/matrices.ts";
import type { Vector3 } from "@/src/common/graphics/types.ts";
import { createProgram, requireResource } from "@/src/common/webgl/index.ts";
import type { SurfaceMesh } from "../geometry.ts";
import { Mesh } from "./Mesh.ts";
import vertexSource from "./vertex.glsl?raw";
import fragmentSource from "./fragment.glsl?raw";

export class Renderer {
  private readonly program: WebGLProgram;
  private readonly mesh: Mesh;
  private readonly uniforms: Record<string, WebGLUniformLocation>;

  constructor(private readonly gl: WebGL2RenderingContext, surface: SurfaceMesh) {
    this.program = createProgram(gl, vertexSource, fragmentSource);
    this.mesh = new Mesh(gl, this.program, surface);
    this.uniforms = Object.fromEntries(["uView", "uProjection", "uEye"]
      .map((name) => [name, requireResource(gl.getUniformLocation(this.program, name))]));
    gl.clearColor(0.93, 0.95, 0.98, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    gl.frontFace(gl.CCW);
  }

  draw(eye: Vector3): void {
    const gl = this.gl;
    if (gl.isContextLost()) return;
    const aspect = gl.canvas.width / gl.canvas.height;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.uniform("uView"), false, viewMatrix(eye));
    gl.uniformMatrix4fv(this.uniform("uProjection"), false, projectionMatrix(aspect, 2.1 * Math.min(1, aspect)));
    gl.uniform3fv(this.uniform("uEye"), eye);
    this.mesh.draw();
    gl.bindVertexArray(null);
  }

  dispose(): void {
    this.mesh.dispose();
    this.gl.deleteProgram(this.program);
  }

  private uniform(name: string): WebGLUniformLocation {
    return requireResource(this.uniforms[name] ?? null);
  }
}
