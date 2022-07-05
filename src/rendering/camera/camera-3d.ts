import { create, invert, lookAt, Matrix4x4 } from '../../math/matrix4x4';
import { Vector3 } from '../../math/vector3';
import { Camera } from './camera';

export class Camera3D implements Camera {
  public p: Matrix4x4 = create();
  public v: Matrix4x4 = create();
  private _target: Vector3 = [0, 0, 0];
  private _position: Vector3 = [0, 0, 0];

  constructor(position: Vector3, target: Vector3) {
    this._position = position;
    this._target = target;
    this._buildMatrix();
  }

  public set position(value: Vector3) {
    this._position = value;
    this._buildMatrix();
  }

  public set target(value: Vector3) {
    this._target = value;
    this._buildMatrix();
  }

  private _buildMatrix() {
    lookAt(this.p, this._position, this._target, [0, 1, 0]);
    invert(this.v, this.p);
  }
}
