import { DEGREE_TO_RADIAN } from '../../math/util';
import { Vector2 } from '../../math/vector2';
import { Degree, Radian } from '../../types';
import { SquareMaterial } from '../materials/square-material';
import { Mesh } from '../meshes/mesh';
import { Quad } from '../meshes/quad';
import { Entity } from './entity';
import { Corner as CornerMesh } from '../meshes/corner';

export class TwoDimensionalEntity extends Entity {
  protected _position: Vector2;
  protected _size: Vector2;
  protected _rotation: Radian;
  constructor(
    gl: WebGL2RenderingContext,
    id: string,
    position: Vector2,
    size: Vector2,
    rotation: Degree,
    isDynamic = false,
    mesh: Mesh,
  ) {
    super(gl, id, mesh, new SquareMaterial(gl), isDynamic);
    this._position = position;
    this._size = size;
    this._rotation = rotation * DEGREE_TO_RADIAN;
  }

  public override preDraw(gl: WebGL2RenderingContext): void {
    const clipX = (this._position[0] / gl.canvas.width) * 2 - 1;
    const clipY = (this._position[1] / gl.canvas.height) * -2 + 1;
    const clipWidth = (this._size[0] / gl.canvas.width) * 2;
    const clipHeight = (this._size[1] / gl.canvas.height) * -2;
    gl.uniformMatrix3fv(this.material.shader.u_t, false, [
      clipWidth,
      0,
      0,
      0,
      clipHeight,
      0,
      clipX,
      clipY,
      1,
    ]);
  }
}

export class Corner extends TwoDimensionalEntity {
  constructor(
    gl: WebGL2RenderingContext,
    id: string,
    position: Vector2,
    size: Vector2,
    rotation: Degree,
    isDynamic = false,
  ) {
    super(gl, id, position, size, rotation, isDynamic, new CornerMesh());
  }
}
export class Rectangle extends TwoDimensionalEntity {
  constructor(
    gl: WebGL2RenderingContext,
    id: string,
    position: Vector2,
    size: Vector2,
    rotation: Degree,
    isDynamic = false,
  ) {
    super(gl, id, position, size, rotation, isDynamic, new Quad());
  }
}
