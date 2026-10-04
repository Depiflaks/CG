import { colors } from "./colors.ts";
import { at, requireResource } from "./checked.ts";
import { circlePoints } from "./geometry.ts";
import { createProgram } from "./ShaderProgram.ts";
import { triangulate } from "./triangulate.ts";
import type { Color, Point } from "./types.ts";
import { VertexBatch } from "./VertexBatch.ts";

export class WebGLRenderer {
  private readonly program: WebGLProgram;
  private readonly buffer: WebGLBuffer;
  private readonly vao: WebGLVertexArrayObject;
  private readonly batch = new VertexBatch();

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.program = createProgram(gl);
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

  fill(points: readonly Point[], color: Color): void {
    if (points.length < 3) return;
    for (const index of triangulate(points)) {
      this.batch.append(at(points, index), color);
    }
  }

  shape(points: readonly Point[], color: Color, width = 2): void {
    this.fill(points, color);
    this.polyline(points, colors.outline, width, true);
  }

  circle(center: Point, radius: number, color: Color): void {
    const points = circlePoints(center, radius);
    for (let index = 0; index < points.length; index += 1) {
      this.batch.append(center, color);
      this.batch.append(at(points, index), color);
      this.batch.append(at(points, (index + 1) % points.length), color);
    }
    this.polyline(points, colors.outline, 2, true);
  }

  line(start: Point, end: Point, color: Color, width = 2): void {
    if (width <= 0) return;
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const length = Math.hypot(dx, dy);
    if (length === 0) return;
    const x = -dy * width / length / 2;
    const y = dx * width / length / 2;
    const points: Point[] = [[start[0] + x, start[1] + y], [end[0] + x, end[1] + y],
      [end[0] - x, end[1] - y], [start[0] - x, start[1] - y]];
    this.fill(points, color);
  }

  polyline(points: readonly Point[], color: Color, width = 2, closed = false): void {
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
