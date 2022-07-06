import { Shader } from '../shader';

export abstract class Material {
  public name: string;
  public shader: Shader;

  public constructor(name: string, shader: Shader) {
    this.name = name;
    this.shader = shader;
  }
}
