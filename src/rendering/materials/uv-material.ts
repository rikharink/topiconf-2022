import { initShaderProgram } from '../gl-util';
import { Material } from './material';
import vert from '../shaders/default.vert.glsl';
import frag from '../shaders/uv.frag.glsl';

export class UVMaterial extends Material {
  public constructor(gl: WebGL2RenderingContext) {
    super(initShaderProgram(gl, vert, frag)!);
  }
}
