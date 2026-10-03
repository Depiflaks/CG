import vertexShaderSource from "./vertex.glsl?raw";
import fragmentShaderSource from "./fragment.glsl?raw";
import { approximateBezier, type ControlPoints } from "./bezier.ts";

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (shader === null) throw new Error("Failed to create shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation failed: ${log ?? ""}`);
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram {
  const vertex = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program linking failed: ${log ?? ""}`);
  }
  return program;
}

function dashedPolygon(points: ControlPoints, width: number, height: number): Float32Array {
  const vertices: number[] = [];
  for (let i = 0; i < 3; i += 1) {
    const start = points[i];
    const end = points[i + 1];
    if (start === undefined || end === undefined) continue;
    const delta = end.subtract(start);
    const length = Math.hypot(delta.x * width / 2, delta.y * height / 2);
    for (let offset = 0; offset < length; offset += 14) {
      const a = start.add(delta.scale(offset / length));
      const b = start.add(delta.scale(Math.min(offset + 8, length) / length));
      vertices.push(a.x, a.y, b.x, b.y);
    }
  }
  return new Float32Array(vertices);
}

export function createRenderer(gl: WebGLRenderingContext) {
  const program = createProgram(gl);
  const buffer = gl.createBuffer();
  const position = gl.getAttribLocation(program, "aPosition");
  const color = gl.getUniformLocation(program, "uColor");
  const pointSize = gl.getUniformLocation(program, "uPointSize");
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(position);

  const draw = (vertices: Float32Array, mode: number, rgb: [number, number, number]): void => {
    gl.uniform3f(color, rgb[0], rgb[1], rgb[2]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    gl.drawArrays(mode, 0, vertices.length / 2);
  };

  const render = (points: ControlPoints): void => {
    const ratio = window.devicePixelRatio || 1;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.08, 0.08, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(pointSize, 12 * ratio);
    draw(dashedPolygon(points, gl.canvas.width / ratio, gl.canvas.height / ratio), gl.LINES, [0.5, 0.5, 0.6]);
    draw(approximateBezier(points), gl.LINE_STRIP, [0.2, 0.8, 1]);
    draw(new Float32Array(points.flatMap((point) => [point.x, point.y])), gl.POINTS, [1, 0.65, 0.2]);
  };

  return { render, dispose: (): void => {
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
  } };
}
