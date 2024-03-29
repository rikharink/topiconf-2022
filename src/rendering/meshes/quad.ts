import { Vector3 } from '../../math/vector3';
import { Mesh } from './mesh';

interface QuadOptions {
  p1: Vector3;
  p2: Vector3;
  p3: Vector3;
  p4: Vector3;
}

export class Quad extends Mesh {
  constructor(options: Partial<QuadOptions> = {}) {
    super();
    const {
      p1 = [-1, -1, 0],
      p2 = [1, -1, 0],
      p3 = [-1, 1, 0],
      p4 = [1, 1, 0],
    } = options;
    this.setVertices(p1, p2, p3, p4);
    this.setTriangles(0, 1, 2, 1, 3, 2);
    this.setUvs([0, 1], [1, 1], [0, 0], [1, 0]);
    this.setColors([1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1], [1, 0, 1, 1]);
    this.recalculateNormals();
  }
}
