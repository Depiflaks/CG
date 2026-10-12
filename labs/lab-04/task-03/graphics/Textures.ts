import { requireResource } from "@/src/common/webgl/index.ts";
import type { TextureImages } from "./materials.ts";

export class Textures {
  private readonly surface: WebGLTexture;

  constructor(private readonly gl: WebGL2RenderingContext, images: TextureImages) {
    this.surface = requireResource(gl.createTexture());
    this.bind();
    this.uploadMaterials(images.materials);
  }

  bind(): void {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.surface);
  }

  dispose(): void {
    this.gl.deleteTexture(this.surface);
  }

  private uploadMaterials(images: readonly HTMLImageElement[]): void {
    const gl = this.gl;
    const first = requireResource(images[0] ?? null, "Не найдены текстуры материалов.");
    const width = first.naturalWidth;
    const height = first.naturalHeight;
    if (images.some((image) => image.naturalWidth !== width || image.naturalHeight !== height)) {
      throw new Error("Error: size missmatch");
    }
    const levels = 1 + Math.floor(Math.log2(Math.max(width, height)));
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, levels, gl.RGBA8, width, height, images.length);
    images.forEach((image, layer) => {
      gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, layer,
        width, height, 1, gl.RGBA, gl.UNSIGNED_BYTE, image);
    });
    this.configure();
  }

  private configure(): void {
    const gl = this.gl;
    const target = gl.TEXTURE_2D_ARRAY;
    gl.generateMipmap(target);
    gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.REPEAT);
  }
}
