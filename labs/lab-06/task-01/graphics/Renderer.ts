import { Matrix4 } from "three";
import { projectionMatrix, viewMatrix } from "@/src/common/graphics/matrices.ts";
import type { Vector3 } from "@/src/common/graphics/types.ts";
import { createProgram, requireResource } from "@/src/common/webgl/index.ts";
import type { Material, ModelPart } from "../formats/types.ts";
import { Mesh } from "./Mesh.ts";
import { Texture } from "./Texture.ts";
import vertexSource from "./vertex.glsl?raw";
import fragmentSource from "./fragment.glsl?raw";

const BACKGROUND = [0.85, 0.88, 0.89, 1] as const;
const FOCAL_LENGTH = 2;
const UNIFORMS = ["uModel", "uView", "uProjection", "uEye", "uAmbient", "uDiffuse", "uSpecular", "uShininess",
  "uTexture", "uTextured"] as const;

interface DrawPart {
  mesh: Mesh;
  material: Material;
  texture?: Texture;
  rotation?: ModelPart["rotation"];
}

export class Renderer {
  private readonly program: WebGLProgram;
  private readonly uniforms = new Map<string, WebGLUniformLocation>();
  private readonly textures = new Map<string, Texture>();
  private readonly parts: DrawPart[] = [];

  constructor(private readonly gl: WebGL2RenderingContext, parts: ModelPart[],
    redraw: () => void, failed: (message: string) => void) {
    this.program = createProgram(gl, vertexSource, fragmentSource);
    try {
      this.initializeUniforms();
      this.createParts(parts, redraw, failed);
      gl.clearColor(...BACKGROUND);
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);
      gl.disable(gl.BLEND);
    } catch (error) {
      this.dispose();
      throw error;
    }
  }

  draw(eye: Vector3, target: Vector3, model: Float32Array, time: number): void {
    const gl = this.gl;
    if (gl.isContextLost()) return;
    const aspect = gl.canvas.width / gl.canvas.height;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.uniform("uView"), false, viewMatrix(eye, target));
    gl.uniformMatrix4fv(this.uniform("uProjection"), false,
      projectionMatrix(aspect, FOCAL_LENGTH * Math.min(1, aspect)));
    gl.uniform3fv(this.uniform("uEye"), eye);
    gl.uniform1i(this.uniform("uTexture"), 0);
    for (const part of this.parts) this.drawPart(part, model, time);
    gl.bindVertexArray(null);
  }

  dispose(): void {
    this.parts.forEach(({ mesh }) => { mesh.dispose(); });
    this.textures.forEach((texture) => { texture.dispose(); });
    this.gl.deleteProgram(this.program);
  }

  private initializeUniforms(): void {
    for (const name of UNIFORMS) {
      this.uniforms.set(name, requireResource(this.gl.getUniformLocation(this.program, name)));
    }
  }

  private createParts(parts: ModelPart[], redraw: () => void, failed: (message: string) => void): void {
    for (const { vertices, material, rotation } of parts) {
      const url = material.diffuseMap;
      if (url && !this.textures.has(url)) this.textures.set(url, new Texture(this.gl, url, redraw, failed));
      const texture = url ? this.textures.get(url) : undefined;
      this.parts.push({ mesh: new Mesh(this.gl, this.program, vertices), material, texture, rotation });
    }
  }

  private drawPart({ mesh, material, texture, rotation }: DrawPart, model: Float32Array, time: number): void {
    const gl = this.gl;
    gl.uniformMatrix4fv(this.uniform("uModel"), false, this.modelMatrix(model, rotation, time));
    gl.uniform3fv(this.uniform("uAmbient"), material.ambient);
    gl.uniform3fv(this.uniform("uDiffuse"), material.diffuse);
    gl.uniform3fv(this.uniform("uSpecular"), material.specular);
    gl.uniform1f(this.uniform("uShininess"), material.shininess);
    gl.uniform1i(this.uniform("uTextured"), texture ? 1 : 0);
    texture?.bind();
    mesh.draw();
  }

  private modelMatrix(model: Float32Array, rotation: ModelPart["rotation"], time: number): Float32Array {
    if (!rotation) return model;
    const [x, y, z] = rotation.pivot;
    const matrix = new Matrix4().fromArray(model)
      .multiply(new Matrix4().makeTranslation(x, y, z))
      .multiply(new Matrix4().makeRotationZ(time * rotation.speed))
      .multiply(new Matrix4().makeTranslation(-x, -y, -z));
    return new Float32Array(matrix.elements);
  }

  private uniform(name: string): WebGLUniformLocation {
    return requireResource(this.uniforms.get(name) ?? null);
  }
}
