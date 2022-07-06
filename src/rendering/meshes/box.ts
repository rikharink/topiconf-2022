import { Vector2 } from '../../math/vector2';
import { Vector3 } from '../../math/vector3';
import { Mesh } from './mesh';

interface BoxOptions {
  width: number;
  height: number;
  depth: number;
}

export class Box extends Mesh {
  constructor(options?: Partial<BoxOptions>) {
    super();
    const { depth = 2, width = 2, height = 2 } = options ?? {};
    const p0: Vector3 = [-width * 0.5, -height * 0.5, depth * 0.5];
    const p1: Vector3 = [width * 0.5, -height * 0.5, depth * 0.5];
    const p2: Vector3 = [width * 0.5, -height * 0.5, -depth * 0.5];
    const p3: Vector3 = [-width * 0.5, -height * 0.5, -depth * 0.5];

    const p4: Vector3 = [-width * 0.5, height * 0.5, depth * 0.5];
    const p5: Vector3 = [width * 0.5, height * 0.5, depth * 0.5];
    const p6: Vector3 = [width * 0.5, height * 0.5, -depth * 0.5];
    const p7: Vector3 = [-width * 0.5, height * 0.5, -depth * 0.5];

    this.setVertices([
      //FRONT
      p0,
      p1,
      p4,
      p5,
      //LEFT
      p3,
      p0,
      p7,
      p4,
      //BACK
      p2,
      p3,
      p6,
      p7,
      //RIGHT
      p1,
      p2,
      p5,
      p6,
      //BOTTOM
      p3,
      p2,
      p0,
      p1,
      //TOP
      p4,
      p5,
      p7,
      p6,
    ]);

    this.setTriangles([
      //FRONT
      0, 1, 2, 1, 3, 2,
      //LEFT
      4, 5, 6, 5, 7, 6,
      //BACK
      8, 9, 10, 9, 11, 10,
      //RIGHT
      12, 13, 14, 13, 15, 14,
      //BOTTOM
      16, 17, 18, 17, 19, 18,
      //TOP
      20, 21, 22, 21, 23, 22,
    ]);

    const uv00: Vector2 = [0, 0];
    const uv10: Vector2 = [1, 0];
    const uv01: Vector2 = [0, 1];
    const uv11: Vector2 = [1, 1];
    this.setUvs([
      // Front
      uv01,
      uv11,
      uv00,
      uv10,
      // Left
      uv01,
      uv11,
      uv00,
      uv10,
      // Back
      uv01,
      uv11,
      uv00,
      uv10,
      // Right
      uv01,
      uv11,
      uv00,
      uv10,
      // Bottom
      uv01,
      uv11,
      uv00,
      uv10,
      // Top
      uv01,
      uv11,
      uv00,
      uv10,
    ]);
    this.recalculateNormals();
  }

  public setUnwrappedUvs() {
    this.setUvs([
      //FRONT
      [0, 2 / 3],
      [0.25, 2 / 3],
      [0, 1 / 3],
      [0.25, 1 / 3],
      //LEFT
      [0.25, 2 / 3],
      [0.5, 2 / 3],
      [0.25, 1 / 3],
      [0.5, 1 / 3],
      //BACK
      [0.5, 2 / 3],
      [0.75, 2 / 3],
      [0.5, 1 / 3],
      [0.75, 1 / 3],
      //RIGHT
      [0.75, 2 / 3],
      [1, 2 / 3],
      [0.75, 1 / 3],
      [1, 1 / 3],
      //BOTTOM
      [0.25, 1],
      [0.5, 1],
      [0.25, 2 / 3],
      [0.5, 2 / 3],
      //TOP
      [0.25, 1 / 3],
      [0.5, 1 / 3],
      [0.25, 0],
      [0.5, 0],
    ]);
  }
}
