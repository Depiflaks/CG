export function mount(container: HTMLElement): () => void {
  const canvas = document.createElement("canvas");
  container.append(canvas);

  const gl = canvas.getContext("webgl2");

  if (gl === null) {
    throw new Error("WebGL 2 is not supported by this browser.");
  }

  // ---------------------------------------------------------------------------
  // Shaders
  // ---------------------------------------------------------------------------

  const vertexShaderSource = `#version 300 es

    in vec3 a_position;
    in vec3 a_color;

    uniform mat4 u_projection;
    uniform mat4 u_modelView;

    out vec3 v_color;

    void main() {
      gl_Position = u_projection * u_modelView * vec4(a_position, 1.0);
      v_color = a_color;
    }
  `;

  const fragmentShaderSource = `#version 300 es

    precision highp float;

    in vec3 v_color;
    out vec4 outColor;

    void main() {
      outColor = vec4(v_color, 1.0);
    }
  `;

  // ---------------------------------------------------------------------------
  // WebGL helpers
  // ---------------------------------------------------------------------------

  function createShader(type: GLenum, source: string): WebGLShader {
    const shader = gl.createShader(type);

    if (shader === null) {
      throw new Error("Failed to create shader.");
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compilation failed:\n${log ?? ""}`);
    }

    return shader;
  }

  function createProgram(
    vertexSource: string,
    fragmentSource: string,
  ): WebGLProgram {
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);

    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();

    if (program === null) {
      throw new Error("Failed to create WebGL program.");
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Program linking failed:\n${log ?? ""}`);
    }

    return program;
  }

  // ---------------------------------------------------------------------------
  // Program
  // ---------------------------------------------------------------------------

  const program = createProgram(vertexShaderSource, fragmentShaderSource);

  const positionLocation = gl.getAttribLocation(program, "a_position");

  const colorLocation = gl.getAttribLocation(program, "a_color");

  const projectionLocation = gl.getUniformLocation(program, "u_projection");

  const modelViewLocation = gl.getUniformLocation(program, "u_modelView");

  if (
    positionLocation < 0 ||
    colorLocation < 0 ||
    projectionLocation === null ||
    modelViewLocation === null
  ) {
    throw new Error("Failed to resolve WebGL locations.");
  }

  // ---------------------------------------------------------------------------
  // Cube geometry
  // ---------------------------------------------------------------------------

  // Each face contains two triangles.
  const positions = new Float32Array([
    // Front
    -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1,

    // Back
    1, -1, -1, -1, -1, -1, -1, 1, -1, 1, -1, -1, -1, 1, -1, 1, 1, -1,

    // Top
    -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, 1, 1, 1, -1, -1, 1, -1,

    // Bottom
    -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, -1, 1, -1, 1, -1, -1, 1,

    // Right
    1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, 1, 1, -1, 1, 1, 1,

    // Left
    -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, -1, -1, -1, 1, 1, -1, 1, -1,
  ]);

  const faceColors = [
    [1.0, 0.0, 0.0], // red
    [0.0, 1.0, 0.0], // green
    [0.0, 0.0, 1.0], // blue
    [1.0, 1.0, 0.0], // yellow
    [1.0, 0.0, 1.0], // magenta
    [0.0, 1.0, 1.0], // cyan
  ];

  const colors = new Float32Array(
    faceColors
      .flatMap((color) => Array.from({ length: 6 }, () => color))
      .flat(),
  );

  // ---------------------------------------------------------------------------
  // Buffers
  // ---------------------------------------------------------------------------

  const positionBuffer = gl.createBuffer();

  if (positionBuffer === null) {
    throw new Error("Failed to create position buffer.");
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const colorBuffer = gl.createBuffer();

  if (colorBuffer === null) {
    throw new Error("Failed to create color buffer.");
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

  const vao = gl.createVertexArray();

  if (vao === null) {
    throw new Error("Failed to create vertex array.");
  }

  gl.bindVertexArray(vao);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.enableVertexAttribArray(colorLocation);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);

  // ---------------------------------------------------------------------------
  // Matrix helpers
  // ---------------------------------------------------------------------------

  function perspective(
    fov: number,
    aspect: number,
    near: number,
    far: number,
  ): Float32Array {
    const f = 1 / Math.tan(fov / 2);
    const range = 1 / (near - far);

    return new Float32Array([
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (near + far) * range,
      -1,
      0,
      0,
      2 * near * far * range,
      0,
    ]);
  }

  function rotationX(angle: number): Float32Array {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
  }

  function rotationY(angle: number): Float32Array {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
  }

  function translation(x: number, y: number, z: number): Float32Array {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
  }

  function multiply(a: Float32Array, b: Float32Array): Float32Array {
    const result = new Float32Array(16);

    for (let column = 0; column < 4; column += 1) {
      for (let row = 0; row < 4; row += 1) {
        result[column * 4 + row] =
          a[0 * 4 + row] * b[column * 4 + 0] +
          a[1 * 4 + row] * b[column * 4 + 1] +
          a[2 * 4 + row] * b[column * 4 + 2] +
          a[3 * 4 + row] * b[column * 4 + 3];
      }
    }

    return result;
  }

  // ---------------------------------------------------------------------------
  // Interaction state
  // ---------------------------------------------------------------------------

  let rotationXAngle = -0.4;
  let rotationYAngle = 0.6;

  let dragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  const onPointerDown = (event: PointerEvent): void => {
    dragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!dragging) {
      return;
    }

    const dx = event.clientX - lastMouseX;
    const dy = event.clientY - lastMouseY;

    rotationYAngle += dx * 0.01;
    rotationXAngle += dy * 0.01;

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  };

  const onPointerUp = (event: PointerEvent): void => {
    dragging = false;

    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);

  // ---------------------------------------------------------------------------
  // Resize
  // ---------------------------------------------------------------------------

  const resize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    gl.viewport(0, 0, width, height);
  };

  window.addEventListener("resize", resize);

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  gl.useProgram(program);
  gl.bindVertexArray(vao);

  const render = (): void => {
    gl.clearColor(0.04, 0.06, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = canvas.width / canvas.height;

    const projection = perspective(Math.PI / 4, aspect, 0.1, 100);

    const rotation = multiply(
      rotationY(rotationYAngle),
      rotationX(rotationXAngle),
    );

    const modelView = multiply(translation(0, 0, -5), rotation);

    gl.uniformMatrix4fv(projectionLocation, false, projection);

    gl.uniformMatrix4fv(modelViewLocation, false, modelView);

    gl.drawArrays(gl.TRIANGLES, 0, positions.length / 3);

    requestAnimationFrame(render);
  };

  resize();

  const animationFrame = requestAnimationFrame(render);

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  return (): void => {
    window.removeEventListener("resize", resize);

    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerUp);

    cancelAnimationFrame(animationFrame);

    gl.bindVertexArray(null);

    gl.deleteBuffer(positionBuffer);
    gl.deleteBuffer(colorBuffer);
    gl.deleteVertexArray(vao);
    gl.deleteProgram(program);

    canvas.remove();
  };
}
