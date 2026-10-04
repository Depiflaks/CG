import { createCanvas } from "@/src/common/canvas/index.ts";
import vertexShaderSource from "./vertex.glsl?raw";
import fragmentShaderSource from "./fragment.glsl?raw";
import { createBuffer, createContext, createProgram } from "@/src/common/webgl/index.ts";

function drawTriangles(gl: WebGL2RenderingContext): void {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.08, 0.08, 0.1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  gl.useProgram(program);

  const loc = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(loc);

  const bufferA = createBuffer(gl, new Float32Array([-0.9, -0.5, -0.1, -0.5, -0.5, 0.5]));
  const bufferB = createBuffer(gl, new Float32Array([0.1, -0.5, 0.9, -0.5, 0.5, 0.5]));

  const colorLoc = gl.getUniformLocation(program, "uColor");

  gl.uniform4f(colorLoc, 1, 0, 0, 1);
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferA);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  gl.uniform4f(colorLoc, 0, 1, 0, 1);
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferB);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

export function mount(container: HTMLElement): () => void {
  const canvas = createCanvas({ className: "", touchAction: "auto" });
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  container.append(canvas);

  const gl = createContext(canvas, "webgl2");
  if (gl !== null) drawTriangles(gl);

  return (): void => {
    canvas.remove();
  };
}
