export function createContext(canvas: HTMLCanvasElement, type: "webgl"): WebGLRenderingContext | null;
export function createContext(canvas: HTMLCanvasElement, type: "webgl2"): WebGL2RenderingContext | null;
export function createContext(canvas: HTMLCanvasElement, type: "webgl" | "webgl2") {
  return canvas.getContext(type);
  
}

export function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
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

export function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram {
  const vertex = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  let fragment: WebGLShader | null = null;
  let program: WebGLProgram | null = null;
  try {
    fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Program linking failed: ${gl.getProgramInfoLog(program) ?? ""}`);
    }
    return program;
  } catch (error) {
    gl.deleteProgram(program);
    throw error;
  } finally {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
  }
}

export function createBuffer(
  gl: WebGLRenderingContext,
  data?: Float32Array<ArrayBuffer>,
  usage = gl.STATIC_DRAW,
): WebGLBuffer {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  if (data !== undefined) gl.bufferData(gl.ARRAY_BUFFER, data, usage);
  return buffer;
}
