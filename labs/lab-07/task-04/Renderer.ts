import { createProgram, requireResource } from "@/src/common/webgl/index.ts";
import type { Images } from "./images.ts";
import vertexSource from "./vertex.glsl?raw";
import fragmentSource from "./fragment.glsl?raw";

export type Origin = readonly [number, number];

export class Renderer {
  private readonly program: WebGLProgram;
  private readonly buffer: WebGLBuffer | null = null;
  private readonly textures: WebGLTexture[] = [];
  private readonly position: number;
  private readonly uniforms: Record<string, WebGLUniformLocation> = {};

  constructor(
    private readonly gl: WebGL2RenderingContext,
    images: Images,
  ) {
    this.program = createProgram(gl, vertexSource, fragmentSource);
    this.position = gl.getAttribLocation(this.program, "aPosition");
    try {
      this.buffer = requireResource(gl.createBuffer());
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW,
      );
      for (const name of [
        "First",
        "Second",
        "ImageAspects",
        "Resolution",
        "Origin",
        "Progress",
        "Source",
      ]) {
        this.uniforms[name] = requireResource(
          gl.getUniformLocation(this.program, `u${name}`),
        );
      }
      for (const image of images) this.textures.push(this.createTexture(image));
      gl.useProgram(this.program);
      gl.uniform1i(this.uniform("First"), 0);
      gl.uniform1i(this.uniform("Second"), 1);
      gl.uniform2f(
        this.uniform("ImageAspects"),
        images[0].naturalWidth / images[0].naturalHeight,
        images[1].naturalWidth / images[1].naturalHeight,
      );
    } catch (error) {
      this.dispose();
      throw error;
    }
  }

  draw(origin: Origin, progress: number, source: number): void {
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.position);
    gl.vertexAttribPointer(this.position, 2, gl.FLOAT, false, 0, 0);
    this.textures.forEach((texture, index) => {
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, texture);
    });
    gl.uniform2f(this.uniform("Resolution"), gl.canvas.width, gl.canvas.height);
    gl.uniform2f(this.uniform("Origin"), origin[0], origin[1]);
    gl.uniform1f(this.uniform("Progress"), progress);
    gl.uniform1f(this.uniform("Source"), source);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  dispose(): void {
    for (const texture of this.textures) this.gl.deleteTexture(texture);
    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteProgram(this.program);
  }

  private uniform(name: string): WebGLUniformLocation {
    return requireResource(this.uniforms[name] ?? null);
  }

  private createTexture(image: HTMLImageElement): WebGLTexture {
    const gl = this.gl;
    const texture = requireResource(gl.createTexture());
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }
}
