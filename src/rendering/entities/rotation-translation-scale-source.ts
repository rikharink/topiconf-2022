import {
  from_rotation_translation_scale,
  Matrix4x4,
} from '../../math/matrix4x4';
import { from_euler, Quaternion } from '../../math/quaternion';
import { Vector3 } from '../../math/vector3';

export class RotationTranslationScaleSource {
  public readonly rotation: Quaternion = from_euler([0, 0, 0, 0], 0, 0, 0);
  public readonly translation: Vector3 = [0, 0, 0];
  public readonly scale: Vector3 = [1, 1, 1];

  public getMatrix(out: Matrix4x4): Matrix4x4 {
    return from_rotation_translation_scale(
      out,
      this.rotation,
      this.translation,
      this.scale,
    );
  }
}
