import { projectionMatrix, viewMatrix } from "@/src/common/graphics/matrices.ts";
import type { Vector3 } from "@/src/common/graphics/types.ts";
import { createProgram, requireResource } from "@/src/common/webgl/index.ts";
import { Mesh } from "./Mesh.ts";
import { Texture } from "./Texture.ts";
import vertexSource from "./vertex.glsl?raw";
import fragmentSource from "./fragment.glsl?raw";

export class Renderer {
  private readonly program: WebGLProgram;
  private readonly mesh: Mesh;
  private readonly texture: Texture;
  private readonly uniforms: Record<string, WebGLUniformLocation>;

  constructor(private readonly gl: WebGL2RenderingContext, data: Float32Array,
    redraw: () => void, failed: () => void) {
    this.program = createProgram(gl, vertexSource, fragmentSource);
    this.mesh = new Mesh(gl, this.program, data);
    this.texture = new Texture(gl, redraw, failed);
    this.uniforms = Object.fromEntries(["uView", "uProjection", "uEye", "uTexture"]
      .map((name) => [name, requireResource(gl.getUniformLocation(this.program, name))]));
    gl.clearColor(0.82, 0.81, 0.77, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.disable(gl.BLEND);
  }

  draw(eye: Vector3, target: Vector3): void {
    const gl = this.gl;
    if (gl.isContextLost()) return;
    const aspect = gl.canvas.width / gl.canvas.height;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.uniform("uView"), false, viewMatrix(eye, target));
    gl.uniformMatrix4fv(this.uniform("uProjection"), false, projectionMatrix(aspect, 2.3 * Math.min(1, aspect)));
    gl.uniform3fv(this.uniform("uEye"), eye);
    gl.uniform1i(this.uniform("uTexture"), 0);
    this.texture.bind();
    this.mesh.draw();
    gl.bindVertexArray(null);
  }

  dispose(): void {
    this.mesh.dispose();
    this.texture.dispose();
    this.gl.deleteProgram(this.program);
  }

  private uniform(name: string): WebGLUniformLocation {
    return requireResource(this.uniforms[name] ?? null);
  }
}
