import { Matrix4x4 } from '../../math/matrix4x4';

export interface Camera {
  p: Matrix4x4;
  v: Matrix4x4;
}
