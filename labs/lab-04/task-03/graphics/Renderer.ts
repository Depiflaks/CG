import { projectionMatrix, viewMatrix } from "@/src/common/graphics/matrices.ts";
import { createProgram, requireResource } from "@/src/common/webgl/index.ts";
import type { Player } from "../camera/Player.ts";
import { Mesh } from "./Mesh.ts";
import { Textures } from "./Textures.ts";
import type { TextureImages } from "./materials.ts";
import { createSkyGeometry } from "./sky.ts";
import vertexSource from "./vertex.glsl?raw";
import fragmentSource from "./fragment.glsl?raw";

export class Renderer {
  private readonly program: WebGLProgram;
  private readonly mesh: Mesh;
  private readonly sky: Mesh;
  private readonly textures: Textures;
  private readonly view: WebGLUniformLocation;
  private readonly projection: WebGLUniformLocation;
  private readonly eye: WebGLUniformLocation;

  constructor(private readonly gl: WebGL2RenderingContext, geometry: Float32Array, images: TextureImages) {
    this.program = createProgram(gl, vertexSource, fragmentSource);
    this.mesh = new Mesh(gl, geometry);
    this.sky = new Mesh(gl, createSkyGeometry());
    this.textures = new Textures(gl, images);
    this.view = requireResource(gl.getUniformLocation(this.program, "uView"));
    this.projection = requireResource(gl.getUniformLocation(this.program, "uProjection"));
    this.eye = requireResource(gl.getUniformLocation(this.program, "uEye"));
    gl.useProgram(this.program);
    gl.uniform1i(requireResource(gl.getUniformLocation(this.program, "uSurface")), 0);
    gl.uniform1i(requireResource(gl.getUniformLocation(this.program, "uShadow")), 1);
    gl.clearColor(0.65, 0.76, 0.86, 1);
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
    gl.uniformMatrix4fv(this.projection, false, projectionMatrix(aspect, 1.5, 0.08, 200));
    gl.uniform3fv(this.eye, player.eye);
    this.textures.bind();
    gl.depthMask(false);
    gl.disable(gl.CULL_FACE);
    this.sky.draw();
    gl.depthMask(true);
    gl.enable(gl.CULL_FACE);
    this.mesh.draw();
  }

  dispose(): void {
    this.mesh.dispose();
    this.sky.dispose();
    this.textures.dispose();
    this.gl.deleteProgram(this.program);
  }
}
