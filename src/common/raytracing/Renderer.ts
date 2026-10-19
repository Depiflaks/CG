import type { Vector3 } from "@/src/common/graphics/types.ts";
import { createProgram } from "@/src/common/webgl/index.ts";
import type { Scene } from "./scene.ts";
import vertexSource from "./vertex.glsl?raw";
import fragmentSource from "./fragment.glsl?raw";

export class Renderer {
  private readonly program: WebGLProgram;
  private readonly uniforms = new Map<string, WebGLUniformLocation | null>();

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.program = createProgram(gl, vertexSource, fragmentSource);
  }

  draw(scene: Scene, eye: Vector3, target: Vector3): void {
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(this.program);
    gl.uniform2f(this.uniform("uResolution"), gl.canvas.width, gl.canvas.height);
    this.vector("uEye", eye);
    this.vector("uTarget", target);
    gl.uniform1i(this.uniform("uShadows"), ["none", "hard", "soft"].indexOf(scene.shadows));
    gl.uniform1i(this.uniform("uSamples"), scene.samples);
    this.setLight(scene);
    scene.materials.forEach((material, index) => {
      const prefix = `uMaterials[${String(index)}]`;
      this.vector(`${prefix}.ambient`, material.ambient);
      this.vector(`${prefix}.diffuse`, material.diffuse);
      this.vector(`${prefix}.specular`, material.specular);
      gl.uniform1f(this.uniform(`${prefix}.shininess`), material.shininess);
    });
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose(): void {
    this.gl.deleteProgram(this.program);
  }

  private setLight(scene: Scene): void {
    this.vector("uLight.position", scene.light.position);
    this.vector("uLight.ambient", scene.light.ambient);
    this.vector("uLight.diffuse", scene.light.diffuse);
    this.vector("uLight.specular", scene.light.specular);
    this.gl.uniform1f(this.uniform("uLight.radius"), scene.light.radius);
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
