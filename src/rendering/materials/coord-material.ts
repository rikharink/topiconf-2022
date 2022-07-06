import { initShaderProgram } from '../gl-util';
import { Material } from './material';
import vert from '../shaders/default.vert.glsl';
import frag from '../shaders/coord.frag.glsl';

export class CoordMaterial extends Material {
  public constructor(gl: WebGL2RenderingContext) {
    super('coord', initShaderProgram(gl, vert, frag)!);
  }
}
