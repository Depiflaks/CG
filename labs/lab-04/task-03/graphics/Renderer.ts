import { projectionMatrix, viewMatrix } from "@/src/common/graphics/matrices.ts";
import { createProgram, requireResource } from "@/src/common/webgl/index.ts";
import type { Player } from "../camera/Player.ts";
import { Mesh } from "./Mesh.ts";
import vertexSource from "./vertex.glsl?raw";
import fragmentSource from "./fragment.glsl?raw";

export class Renderer {
  private readonly program: WebGLProgram;
  private readonly mesh: Mesh;
  private readonly view: WebGLUniformLocation;
  private readonly projection: WebGLUniformLocation;
  private readonly eye: WebGLUniformLocation;

  constructor(private readonly gl: WebGL2RenderingContext, geometry: Float32Array) {
    this.program = createProgram(gl, vertexSource, fragmentSource);
    this.mesh = new Mesh(gl, geometry);
    this.view = requireResource(gl.getUniformLocation(this.program, "uView"));
    this.projection = requireResource(gl.getUniformLocation(this.program, "uProjection"));
    this.eye = requireResource(gl.getUniformLocation(this.program, "uEye"));
    gl.clearColor(0.04, 0.05, 0.07, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.disable(gl.BLEND);
  }

  draw(player: Player): void {
    const gl = this.gl;
    if (gl.isContextLost()) return;
    const aspect = gl.canvas.width / gl.canvas.height;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.view, false, viewMatrix(player.eye, player.target));
    gl.uniformMatrix4fv(this.projection, false, projectionMatrix(aspect, 1.5, 0.08, 100));
    gl.uniform3fv(this.eye, player.eye);
    this.mesh.draw();
  }

  dispose(): void {
    this.mesh.dispose();
    this.gl.deleteProgram(this.program);
  }
}
