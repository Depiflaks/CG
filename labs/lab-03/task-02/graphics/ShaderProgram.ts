import vertexSource from "./vertex.glsl?raw";
import fragmentSource from "./fragment.glsl?raw";
import { requireResource } from "./checked.ts";

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = requireResource(gl.createShader(type), "Failed to create a WebGL2 shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  const message = gl.getShaderInfoLog(shader);
  gl.deleteShader(shader);
  throw new Error(message ?? "Failed to compile the shader.");
}

function attachShaders(gl: WebGL2RenderingContext, program: WebGLProgram): void {
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
  const program = requireResource(gl.createProgram(), "Failed to create a WebGL2 program.");
  try {
    attachShaders(gl, program);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? "Failed to link the shaders.");
    }
    return program;
  } catch (error) {
    gl.deleteProgram(program);
    throw error;
  }
}
