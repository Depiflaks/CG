import { requireResource } from "@/src/common/webgl/index.ts";
import { createMaterials, createShadowMap, TEXTURE_SIZE } from "./materials.ts";

export class Textures {
  private readonly surface: WebGLTexture;
  private readonly shadow: WebGLTexture;

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.surface = requireResource(gl.createTexture());
    this.shadow = requireResource(gl.createTexture());
    this.bind();
    gl.activeTexture(gl.TEXTURE0);
    this.uploadMaterials();
    gl.activeTexture(gl.TEXTURE1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, createShadowMap());
    this.configure(gl.TEXTURE_2D, gl.CLAMP_TO_EDGE);
  }

  bind(): void {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.surface);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.shadow);
  }

  dispose(): void {
    this.gl.deleteTexture(this.surface);
    this.gl.deleteTexture(this.shadow);
  }

  private uploadMaterials(): void {
    const gl = this.gl;
    const images = createMaterials();
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 9, gl.RGBA8, TEXTURE_SIZE, TEXTURE_SIZE, images.length);
    images.forEach((image, layer) => {
      gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, layer,
        TEXTURE_SIZE, TEXTURE_SIZE, 1, gl.RGBA, gl.UNSIGNED_BYTE, image);
    });
    this.configure(gl.TEXTURE_2D_ARRAY, gl.REPEAT);
  }

  private configure(target: number, wrap: number): void {
    const gl = this.gl;
    gl.generateMipmap(target);
    gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(target, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrap);
  }
}
