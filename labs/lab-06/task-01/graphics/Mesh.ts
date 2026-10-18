import { createBuffer, requireResource } from "@/src/common/webgl/index.ts";
import { POSITION_COMPONENTS, TEXTURE_COMPONENTS, VERTEX_COMPONENTS } from "../formats/types.ts";

const FLOAT_BYTES = Float32Array.BYTES_PER_ELEMENT;
const ATTRIBUTES = [
  ["aPosition", POSITION_COMPONENTS, 0],
  ["aNormal", POSITION_COMPONENTS, POSITION_COMPONENTS],
  ["aUV", TEXTURE_COMPONENTS, POSITION_COMPONENTS * 2],
] as const;

export class Mesh {
  private readonly buffer: WebGLBuffer;
  private readonly array: WebGLVertexArrayObject;
  private readonly count: number;

  constructor(private readonly gl: WebGL2RenderingContext, program: WebGLProgram, data: Float32Array) {
    this.count = data.length / VERTEX_COMPONENTS;
    this.array = requireResource(gl.createVertexArray());
    gl.bindVertexArray(this.array);
    this.buffer = createBuffer(gl, data);
    for (const [name, size, offset] of ATTRIBUTES) {
      const location = gl.getAttribLocation(program, name);
      if (location < 0) throw new Error(`Отсутствует атрибут ${name}`);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, VERTEX_COMPONENTS * FLOAT_BYTES, offset * FLOAT_BYTES);
    }
    gl.bindVertexArray(null);
  }

  draw(): void {
    this.gl.bindVertexArray(this.array);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.count);
  }

  dispose(): void {
    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteVertexArray(this.array);
  }
}
