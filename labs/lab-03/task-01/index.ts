import vertexShaderSource from "./vertex.glsl?raw";
import fragmentShaderSource from "./fragment.glsl?raw";

export function mount(container: HTMLElement): () => void {
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  container.append(canvas);

  const gl = canvas.getContext("webgl");

  if (!gl) {
    return (): void => {
      canvas.remove();
    };
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.08, 0.08, 0.1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  if (!vertexShader) {
    throw new Error("Failed to create shader");
  }
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!fragmentShader) {
    throw new Error("Failed to create shader");
  }
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  const loc = gl.getAttribLocation(program, "aPosition");
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-0.5, 0.0, 0.0, 0.5, 0.5, 0.0]),
    gl.STATIC_DRAW,
  );
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(loc);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  return (): void => {
    canvas.remove();
  };
}
