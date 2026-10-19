import type { Vector3 } from "@/src/common/graphics/types.ts";
import { createProgram } from "@/src/common/webgl/index.ts";
import vertexSource from "@/src/common/raytracing/vertex.glsl?raw";
import fragmentSource from "./fragment.glsl?raw";
import { EYE, LIGHT, TARGET, UP } from "./scene.ts";

export class Renderer {
  private readonly program: WebGLProgram;
  private readonly uniforms = new Map<string, WebGLUniformLocation | null>();

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.program = createProgram(gl, vertexSource, fragmentSource);
    gl.useProgram(this.program);
    this.vector("uEye", EYE);
    this.vector("uTarget", TARGET);
    this.vector("uUp", UP);
    this.vector("uLight", LIGHT);
  }

  draw(model: Float32Array): void {
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(this.program);
    gl.uniform2f(this.uniform("uResolution"), gl.canvas.width, gl.canvas.height);
    gl.uniformMatrix4fv(this.uniform("uModel"), false, model);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose(): void {
    this.gl.deleteProgram(this.program);
  }

  private uniform(name: string): WebGLUniformLocation | null {
    if (!this.uniforms.has(name)) {
      this.uniforms.set(name, this.gl.getUniformLocation(this.program, name));
    }
    return this.uniforms.get(name) ?? null;
  }

  private vector(name: string, value: Vector3): void {
    this.gl.uniform3f(this.uniform(name), ...value);
  }
}
