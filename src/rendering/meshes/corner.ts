import { Vector3 } from '../../math/vector3';
import { Mesh } from './mesh';

export class Corner extends Mesh {
  constructor() {
    super();
    const p0: Vector3 = [-1, -1, 0];
    const p1: Vector3 = [0, -1, 0];
    const p2: Vector3 = [-1, 1, 0];
    const p3: Vector3 = [0, 1, 0];
    const p4: Vector3 = [0, 0, 0];
    const p5: Vector3 = [1, 1, 0];
    const p6: Vector3 = [1, 0, 0];

    this.setVertices(p0, p1, p2, p3, p4, p5, p6);
    this.setTriangles(0, 1, 2, 2, 3, 0, 3, 4, 5, 5, 4, 6);
    this.recalculateNormals();
  }
}
