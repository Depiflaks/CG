export function createContext(canvas: HTMLCanvasElement, type: "webgl", options?: WebGLContextAttributes): WebGLRenderingContext | null;
export function createContext(canvas: HTMLCanvasElement, type: "webgl2", options?: WebGLContextAttributes): WebGL2RenderingContext | null;
export function createContext(canvas: HTMLCanvasElement, type: "webgl" | "webgl2", options?: WebGLContextAttributes) {
  return canvas.getContext(type, options);
}

export function requireResource<T>(resource: T | null, message = "Failed to create a WebGL resource."): T {
  if (resource === null) throw new Error(message);
  return resource;
}

export function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = requireResource(gl.createShader(type), "Failed to create shader.");
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
    program = requireResource(gl.createProgram(), "Failed to create program.");
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
  data?: Float32Array,
  usage = gl.STATIC_DRAW,
): WebGLBuffer {
  const buffer = requireResource(gl.createBuffer(), "Failed to create buffer.");
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  if (data !== undefined) gl.bufferData(gl.ARRAY_BUFFER, data, usage);
  return buffer;
}
