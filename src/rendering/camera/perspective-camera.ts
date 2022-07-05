import {
  create,
  invert,
  Matrix4x4,
  perspective,
  multiply,
} from '../../math/matrix4x4';
import { Radian } from '../../types';
import { Camera } from './camera';

export class PerspectiveCamera implements Camera {
  public p: Matrix4x4 = create();
  public v: Matrix4x4 = create();
  public pv: Matrix4x4 = create();

  private _fov: number;
  private _aspectRatio: number;
  private _zNear: number;
  private _zFar: number;

  constructor(fov: Radian, aspectRatio: number, zNear: number, zFar: number) {
    this._fov = fov;
    this._aspectRatio = aspectRatio;
    this._zNear = zNear;
    this._zFar = zFar;
    this._buildMatrix();
  }

  private _buildMatrix(): void {
    perspective(this.p, this._fov, this._aspectRatio, this._zNear, this._zFar);
    this._buildProjectionViewMatrix();
  }

  private _buildProjectionViewMatrix(): void {
    const c = this.p;
    invert(this.v, c);
    multiply(this.pv, this.p, this.v);
  }
}
