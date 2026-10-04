import vertexSource from "./vertex.glsl?raw";
import fragmentSource from "./fragment.glsl?raw";

export function required<T>(resource: T | null): T {
  if (resource === null) throw new Error("Не удалось создать ресурс WebGL2.");
  return resource;
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = required(gl.createShader(type));
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  const message = gl.getShaderInfoLog(shader);
  gl.deleteShader(shader);
  throw new Error(message ?? "Ошибка компиляции шейдера.");
}

function attach(gl: WebGL2RenderingContext, program: WebGLProgram): void {
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  try {
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.deleteShader(fragment);
  } finally {
    gl.deleteShader(vertex);
  }
}

export function createProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const program = required(gl.createProgram());
  try {
    attach(gl, program);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? "Ошибка связывания шейдеров.");
    }
    return program;
  } catch (error) {
    gl.deleteProgram(program);
    throw error;
  }
}
