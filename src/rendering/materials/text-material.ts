import { initShaderProgram } from '../gl-util';
import { Material } from './material';
import vert from '../shaders/text.vert.glsl';
import frag from '../shaders/text.frag.glsl';

export class TextMaterial extends Material {
  public constructor(gl: WebGL2RenderingContext) {
    super('text', initShaderProgram(gl, vert, frag)!);
  }
}
