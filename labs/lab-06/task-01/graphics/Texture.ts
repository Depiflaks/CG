import { requireResource } from "@/src/common/webgl/index.ts";

const WHITE_PIXEL = new Uint8Array([255, 255, 255, 255]);
const PIXEL_SIZE = 1;

export class Texture {
  private readonly texture: WebGLTexture;
  private readonly image = new Image();

  constructor(private readonly gl: WebGL2RenderingContext, url: string,
    redraw: () => void, failed: (message: string) => void) {
    this.texture = requireResource(gl.createTexture());
    this.bind();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, PIXEL_SIZE, PIXEL_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, WHITE_PIXEL);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    this.image.onload = (): void => {
      this.uploadImage();
      redraw();
    };
    this.image.onerror = (): void => { failed(`Не удалось загрузить текстуру ${url}`); };
    this.image.src = url;
  }

  bind(): void {
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }

  dispose(): void {
    this.image.onload = null;
    this.image.onerror = null;
    this.image.src = "";
    this.gl.deleteTexture(this.texture);
  }

  private uploadImage(): void {
    const gl = this.gl;
    if (gl.isContextLost()) return;
    this.bind();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  }
}
