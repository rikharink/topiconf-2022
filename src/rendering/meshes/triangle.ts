import { normalize } from '../../math/util';
import { Vector3 } from '../../math/vector3';
import { Mesh } from './mesh';
interface TriangleOptions {
  p1: Vector3;
  p2: Vector3;
  p3: Vector3;
}

export class Triangle extends Mesh {
  constructor(options: Partial<TriangleOptions> = {}) {
    super();
    const { p1 = [0, 1, 0], p2 = [-1, -1, 0], p3 = [1, -1, 0] } = options;
    this.vertices = [p1, p2, p3];
    this.triangles = [0, 1, 2];
    this.uvs = this.vertices.map((v) => [
      normalize(v[0], -1, 1),
      1 - normalize(v[1], -1, 1),
    ]);
    this.updateTriangleMap();
    this.recalculateNormals();
    this.colors = [
      [1, 0, 0, 1],
      [0, 1, 0, 1],
      [0, 0, 1, 1],
    ];
  }
}
