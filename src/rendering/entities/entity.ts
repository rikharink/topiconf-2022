import { Vector3 } from '../../math/vector3';
import { Radian } from '../../types';
import { Material } from '../materials/material';
import { Mesh } from '../meshes/mesh';

export class Entity {
  public id: string;
  private _mesh: Mesh;
  private _material: Material;
  private _vao: WebGLVertexArrayObject;

  public rotation: Radian = 0;
  public scale: Vector3 = [1, 1, 1];
  public transposition: Vector3 = [0, 0, 0];

  public constructor(
    gl: WebGL2RenderingContext,
    id: string,
    mesh: Mesh,
    material: Material,
  ) {
    this.id = id;
    this._mesh = mesh;
    this._material = material;

    this._vao = gl.createVertexArray()!;
    this._setupVao(gl);
  }

  private _setupVao(gl: WebGL2RenderingContext): void {
    gl.bindVertexArray(this._vao);

    gl.bindVertexArray(null);
  }

  public render(gl: WebGL2RenderingContext) {
    this._material.shader.enable(gl);
    gl.bindVertexArray(this._vao);

    gl.bindVertexArray(null);
  }
}
