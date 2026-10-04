import { colors } from "./colors.ts";
import { at } from "@/src/common/collections/index.ts";
import { requireResource } from "@/src/common/webgl/index.ts";
import { circlePoints } from "@/src/common/graphics/geometry2D.ts";
import { createProgram } from "@/src/common/webgl/index.ts";
import vertexSource from "./vertex.glsl?raw";
import fragmentSource from "./fragment.glsl?raw";
import { triangulate } from "@/src/common/graphics/triangulate.ts";
import type { Color } from "@/src/common/graphics/types.ts";
import { Vector2 } from "@/src/common/graphics/vector2.ts";
import { VertexBatch } from "./VertexBatch.ts";

export class WebGLRenderer {
  private readonly program: WebGLProgram;
  private readonly buffer: WebGLBuffer;
  private readonly vao: WebGLVertexArrayObject;
  private readonly batch = new VertexBatch();

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.program = createProgram(gl, vertexSource, fragmentSource);
    const buffer = gl.createBuffer();
    const vao = gl.createVertexArray();
    try {
      this.buffer = requireResource(buffer, "Failed to create a WebGL2 buffer.");
      this.vao = requireResource(vao, "Failed to create a WebGL2 vertex array.");
    } catch (error) {
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(this.program);
      throw error;
    }
    this.configure();
  }

  resize(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    const gl = this.gl;
    const scale = Math.min(width / 720, height / 900) * 0.96;
    gl.viewport(0, 0, width, height);
    gl.useProgram(this.program);
    gl.uniform2f(gl.getUniformLocation(this.program, "uViewport"), width / scale, height / scale);
    gl.uniform2f(gl.getUniformLocation(this.program, "uSceneSize"), 720, 900);
  }

  begin(): void {
    this.batch.reset();
    this.gl.clearColor(...colors.background);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  end(): void {
    const gl = this.gl;
    const vertices = this.batch.view();
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6);
  }

  fill(points: readonly Vector2[], color: Color): void {
    if (points.length < 3) return;
    for (const index of triangulate(points)) {
      this.batch.append(at(points, index), color);
    }
  }

  shape(points: readonly Vector2[], color: Color, width = 2): void {
    this.fill(points, color);
    this.polyline(points, colors.outline, width, true);
  }

  circle(center: Vector2, radius: number, color: Color): void {
    const points = circlePoints(center, radius);
    for (let index = 0; index < points.length; index += 1) {
      this.batch.append(center, color);
      this.batch.append(at(points, index), color);
      this.batch.append(at(points, (index + 1) % points.length), color);
    }
    this.polyline(points, colors.outline, 2, true);
  }

  line(start: Vector2, end: Vector2, color: Color, width = 2): void {
    if (width <= 0) return;
    const direction = end.subtract(start);
    const length = direction.magnitude();
    if (length === 0) return;
    const offset = new Vector2(-direction.y, direction.x).scale(width / length / 2);
    const points = [start.add(offset), end.add(offset), end.subtract(offset), start.subtract(offset)];
    this.fill(points, color);
  }

  polyline(points: readonly Vector2[], color: Color, width = 2, closed = false): void {
    const segments = closed ? points.length : points.length - 1;
    for (let index = 0; index < segments; index += 1) {
      this.line(at(points, index), at(points, (index + 1) % points.length), color, width);
    }
  }

  dispose(): void {
    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteVertexArray(this.vao);
    this.gl.deleteProgram(this.program);
  }

  private configure(): void {
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 24, 8);
  }
}
