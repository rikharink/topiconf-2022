import { Shader } from '../shader';

export abstract class Material {
  public shader: Shader;

  public constructor(shader: Shader) {
    this.shader = shader;
  }
}
