import { requireResource } from "@/src/common/webgl/index.ts";
import woodUrl from "../textures/wood.svg?url";

export class Texture {
  private readonly texture: WebGLTexture;
  private readonly image = new Image();

  constructor(private readonly gl: WebGL2RenderingContext, redraw: () => void, failed: () => void) {
    this.texture = requireResource(gl.createTexture());
    this.bind();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([170, 112, 63, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    this.image.onload = (): void => {
      if (gl.isContextLost()) return;
      this.bind();
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      redraw();
    };
    this.image.onerror = failed;
    this.image.src = woodUrl;
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
}
