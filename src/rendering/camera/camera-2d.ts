import { create, Matrix4x4 } from '../../math/matrix4x4';
import { Vector2 } from '../../math/vector2';
import settings from '../../settings';
import { Radian } from '../../types';
import { Camera } from './camera';

export class Camera2D implements Camera {
  public p: Matrix4x4 = create();
  public v: Matrix4x4 = create();
  public pv: Matrix4x4 = create();

  private _viewport: Vector2;
  private _position: Vector2;
  private _zoom: number;
  private _rotation: Radian;

  constructor(
    viewport?: Vector2,
    position: Vector2 = [0, 0],
    zoom = 1,
    rotation: Radian = 0,
  ) {
    this._viewport = viewport ?? settings.rendererSettings.resolution;
    this._position = position;
    this._zoom = zoom;
    this._rotation = rotation;
  }

  private _updateViewProjection() {
    // projection(this.p, this._viewport);
  }
}
