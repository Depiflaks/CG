import { projectionMatrix, viewMatrix } from "../camera/matrices.ts";
import type { Polyhedron, Vector3 } from "../geometry/types.ts";
import { edgeVertices, faceVertices } from "./mesh.ts";
import { createProgram, required } from "./program.ts";
import { VertexBuffer } from "./VertexBuffer.ts";

export interface RenderSettings {
  readonly opacity: number;
  readonly lighting: boolean;
}

export class Renderer {
  private readonly program: WebGLProgram;
  private readonly faces: VertexBuffer;
  private readonly edges: VertexBuffer;
  private readonly uniforms: Record<string, WebGLUniformLocation>;

  constructor(private readonly gl: WebGL2RenderingContext, polyhedron: Polyhedron) {
    this.program = createProgram(gl);
    this.faces = new VertexBuffer(gl, this.program, faceVertices(polyhedron));
    this.edges = new VertexBuffer(gl, this.program, edgeVertices(polyhedron));
    this.uniforms = Object.fromEntries(["uView", "uProjection", "uEye", "uAlpha", "uLighting"]
      .map((name) => [name, required(gl.getUniformLocation(this.program, name))]));
    gl.clearColor(0.93, 0.95, 0.98, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.frontFace(gl.CCW);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.polygonOffset(1, 1);
  }

  draw(eye: Vector3, settings: RenderSettings): void {
    const gl = this.gl;
    if (gl.isContextLost()) return;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.depthMask(true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.uniform("uView"), false, viewMatrix(eye));
    gl.uniformMatrix4fv(this.uniform("uProjection"), false, projectionMatrix(gl.canvas.width / gl.canvas.height));
    gl.uniform3fv(this.uniform("uEye"), eye);
    if (settings.opacity < 1) this.drawTransparent(settings);
    else this.drawOpaque(settings);
    gl.bindVertexArray(null);
  }

  dispose(): void {
    this.faces.dispose();
    this.edges.dispose();
    this.gl.deleteProgram(this.program);
  }

  private uniform(name: string): WebGLUniformLocation {
    return required(this.uniforms[name] ?? null);
  }

  private material(opacity: number, lighting: boolean): void {
    this.gl.uniform1f(this.uniform("uAlpha"), opacity);
    this.gl.uniform1i(this.uniform("uLighting"), lighting ? 1 : 0);
  }

  private drawEdges(): void {
    this.material(1, false);
    this.edges.draw(this.gl.LINES);
  }

  private drawFaces(settings: RenderSettings): void {
    this.material(settings.opacity, settings.lighting);
    this.faces.draw(this.gl.TRIANGLES);
  }

  private drawTransparent(settings: RenderSettings): void {
    const gl = this.gl;
    gl.disable(gl.BLEND);
    gl.disable(gl.CULL_FACE);
    this.drawEdges();
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.cullFace(gl.FRONT);
    this.drawFaces(settings);
    gl.cullFace(gl.BACK);
    this.drawFaces(settings);
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    gl.depthMask(true);
  }

  private drawOpaque(settings: RenderSettings): void {
    const gl = this.gl;
    gl.disable(gl.BLEND);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    this.drawFaces(settings);
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.disable(gl.CULL_FACE);
    this.drawEdges();
  }
}
