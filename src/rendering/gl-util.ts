import {
  GL_ACTIVE_ATTRIBUTES,
  GL_ACTIVE_UNIFORMS,
  GL_COMPILE_STATUS,
  GL_CURRENT_PROGRAM,
  GL_FRAGMENT_SHADER,
  GL_LINK_STATUS,
  GL_VERTEX_SHADER,
} from './gl-constants';

export class Shader {
  public constructor(program: WebGLProgram) {
    this.program = program;
  }

  program: WebGLProgram;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  public enable(gl: WebGL2RenderingContext) {
    if(gl.getParameter(GL_CURRENT_PROGRAM) !== this.program){
        gl.useProgram(this.program);
    }
  }
}

export function initShaderProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragSource: string,
): Shader | null {
  const vertexShader = loadShader(gl, GL_VERTEX_SHADER, vertexSource)!;
  const fragmentShader = loadShader(gl, GL_FRAGMENT_SHADER, fragSource)!;

  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (
    process.env.NODE_ENV === 'development' &&
    !gl.getProgramParameter(program, GL_LINK_STATUS)
  ) {
    console.error(
      'Unable to initialize the shader program: ' +
        gl.getProgramInfoLog(program),
    );
    return null;
  }
  const wrapper: Shader = new Shader(program);

  const numAttributes = gl.getProgramParameter(program, GL_ACTIVE_ATTRIBUTES);
  for (let i = 0; i < numAttributes; i++) {
    const attribute = gl.getActiveAttrib(program, i)!;
    wrapper[attribute.name] = gl.getAttribLocation(program, attribute.name);
  }

  const numUniforms = gl.getProgramParameter(program, GL_ACTIVE_UNIFORMS);
  for (let i = 0; i < numUniforms; i++) {
    const uniform = gl.getActiveUniform(program, i)!;
    wrapper[uniform.name] = gl.getUniformLocation(program, uniform.name);
  }

  return wrapper;
}

function loadShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (
    process.env.NODE_ENV === 'development' &&
    !gl.getShaderParameter(shader, GL_COMPILE_STATUS)
  ) {
    console.error(
      'An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader),
    );
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
