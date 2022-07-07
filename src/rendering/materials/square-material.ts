import { initShaderProgram } from '../gl-util';
import { Material } from './material';
import vert from '../shaders/square.vert.glsl';
import frag from '../shaders/default.frag.glsl';

export class SquareMaterial extends Material {
  public constructor(gl: WebGL2RenderingContext) {
    super('square', initShaderProgram(gl, vert, frag)!);
  }
}
