import { Vector2 } from '../../math/vector2';
import { add, cross, normalize, subtract, Vector3 } from '../../math/vector3';
import { Vector4 } from '../../math/vector4';

export class Mesh {
  private _vertices: Vector3[] = [];
  private _triangles: number[] = [];
  private _normals: Vector3[] = [];
  private _colors: Vector4[] = [];
  private _uvs: Vector2[] = [];

  private _verticesA: Float32Array = new Float32Array();
  private _trianglesA: Uint16Array = new Uint16Array();
  private _uvsA: Float32Array = new Float32Array();
  private _normalsA: Float32Array = new Float32Array();
  private _colorsA: Float32Array = new Float32Array();

  public get verticesV3(): Vector3[] {
    return this._vertices;
  }

  public setVertices(...value: Vector3[]) {
    this._vertices = value;
    this._verticesA = new Float32Array(value.flat());
  }

  public setTriangles(...value: number[]) {
    this._triangles = value;
    this._trianglesA = new Uint16Array(value);
  }

  public setUvs(...value: Vector2[]) {
    this._uvs = value;
    this._uvsA = new Float32Array(value.flat());
  }

  public setColors(...value: Vector4[]) {
    this._colors = value;
    this._colorsA = new Float32Array(value.flat());
  }

  public get vertices(): Float32Array {
    return this._verticesA;
  }

  public get triangles(): Uint16Array {
    return this._trianglesA;
  }

  public get uvs(): Float32Array {
    return this._uvsA;
  }

  public get normals(): Float32Array {
    return this._normalsA;
  }

  public get colors(): Float32Array {
    return this._colorsA;
  }

  private _vertexTriangleMap: Map<number, Array<number>> = new Map<
    number,
    Array<number>
  >();

  public recalculateNormals(): void {
    this._updateTriangleMap();
    for (let i = 0; i < this._vertices.length; i++) {
      const triangles = this._vertexTriangleMap.get(i);
      if (triangles === undefined) {
        throw Error(`Vertex with index ${i} is not part of any triangle`);
      }
      const normal: Vector3 = [0, 0, 0];
      for (const ti of triangles) {
        const p1 = this._vertices[this._triangles[ti]];
        const p2 = this._vertices[this._triangles[ti + 1]];
        const p3 = this._vertices[this._triangles[ti + 2]];
        add(normal, normal, this._getFaceNormal(p1, p2, p3));
      }
      this._normals[i] = normalize(normal, normal);
    }
  }

  private _updateTriangleMap(): void {
    this._vertexTriangleMap.clear();
    for (let i = 0; i < this._triangles.length; i++) {
      const vertex = this._triangles[i];
      const ti = i - (i % 3);
      this._vertexTriangleMap.get(vertex)?.push(ti) ??
        this._vertexTriangleMap.set(vertex, [ti]);
    }
  }

  private _getFaceNormal(p1: Vector3, p2: Vector3, p3: Vector3): Vector3 {
    const A = subtract([0, 0, 0], p2, p1);
    const B = subtract([0, 0, 0], p3, p1);
    return normalize([0, 0, 0], cross([0, 0, 0], A, B));
  }
}
