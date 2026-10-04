import vertexShaderSource from "./vertex.glsl?raw";
import fragmentShaderSource from "./fragment.glsl?raw";
import { approximateBezier, type ControlPoints } from "./bezier.ts";
import { createBuffer, createProgram } from "@/src/common/webgl/index.ts";

function dashedPolygon(points: ControlPoints): Float32Array {
  const vertices: number[] = [];
  const dash = 0.08;
  const step = 0.14;
  for (let i = 0; i < 3; i += 1) {
    const start = points[i];
    const end = points[i + 1];
    if (!start || !end) continue;
    const delta = end.subtract(start);
    const length = delta.magnitude();
    for (let offset = 0; offset < length; offset += step) {
      const a = start.add(delta.scale(offset / length));
      const b = start.add(
        delta.scale(Math.min(offset + dash, length) / length),
      );
      vertices.push(a.x, a.y, b.x, b.y);
    }
  }

  return new Float32Array(vertices);
}

export function createRenderer(gl: WebGL2RenderingContext) {
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  const buffer = createBuffer(gl);
  const position = gl.getAttribLocation(program, "aPosition");
  const color = gl.getUniformLocation(program, "uColor");
  const pointSize = gl.getUniformLocation(program, "uPointSize");
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(position);
  const draw = createDraw(gl, color);
  return {
    render: (points: ControlPoints): void => {
      renderScene(gl, pointSize, points, draw);
    },
    dispose: (): void => {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}

type Draw = (vertices: Float32Array, mode: number, rgb: [number, number, number]) => void;

function createDraw(gl: WebGL2RenderingContext, color: WebGLUniformLocation | null): Draw {
  return (
    vertices: Float32Array,
    mode: number,
    rgb: [number, number, number],
  ): void => {
    gl.uniform3f(color, rgb[0], rgb[1], rgb[2]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    gl.drawArrays(mode, 0, vertices.length / 2);
  };
}

function renderScene(gl: WebGL2RenderingContext, pointSize: WebGLUniformLocation | null,
  points: ControlPoints, draw: Draw): void {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform1f(pointSize, 12);
  draw(dashedPolygon(points), gl.LINES, [0.5, 0.5, 0.6]);
  draw(approximateBezier(points), gl.LINE_STRIP, [0.2, 0.8, 1]);
  draw(
    new Float32Array(points.flatMap((point) => [point.x, point.y])),
    gl.POINTS,
    [1, 0.65, 0.2],
  );
}
