import { hexToRgb } from '../../math/color';
import { copy, create, Matrix4x4, multiply } from '../../math/matrix4x4';
import { from_euler } from '../../math/quaternion';
import { Vector3, copy as copyv3 } from '../../math/vector3';
import { Radian } from '../../types';
import { Camera } from '../camera/camera';
import {
  GL_ARRAY_BUFFER,
  GL_DATA_UNSIGNED_SHORT,
  GL_DYNAMIC_DRAW,
  GL_ELEMENT_ARRAY_BUFFER,
  GL_STATIC_DRAW,
  GL_TEXTURE0,
  GL_TEXTURE_2D,
  GL_TRIANGLES,
} from '../gl-constants';
import { setupAttributeBuffer } from '../gl-util';
import { Material } from '../materials/material';
import { Mesh } from '../meshes/mesh';
import { generateRampTexture } from '../textures/generate-textures';
import { RotationTranslationScaleSource } from './rotation-translation-scale-source';

export class Entity {
  public id: string;
  public w: Matrix4x4 = create();
  public isDirty = true;
  private _mesh: Mesh;
  private _material: Material;
  private _vao: WebGLVertexArrayObject | null = null;
  private _isDynamic: boolean;
  private _trianglesBuffer!: WebGLBuffer;
  private _rts: RotationTranslationScaleSource =
    new RotationTranslationScaleSource();
  private _parent?: Entity;
  private _children: Entity[] = [];
  private _l: Matrix4x4 = create();
  private _uvBuffer!: WebGLBuffer;
  private _normalBuffer!: WebGLBuffer;
  private _colorBuffer!: WebGLBuffer;
  private _texture: WebGLTexture;

  public constructor(
    gl: WebGL2RenderingContext,
    id: string,
    mesh: Mesh,
    material: Material,
    isDynamic = false,
    translation?: Vector3,
    rotation?: [Radian, Radian, Radian],
    scale?: Vector3,
  ) {
    this.id = id;
    this._mesh = mesh;
    this._material = material;
    this._isDynamic = isDynamic;
    this._texture = generateRampTexture(
      gl,
      ['#F19A13', '#E74043', '#982A7C', '#00A0E3']
        .reverse()
        .map((c) => hexToRgb(c)),
    );
    this.updateTRS(translation, rotation, scale);
    this._setupVao(gl);
  }

  public updateTRS(
    translation?: Vector3,
    rotation?: [Radian, Radian, Radian],
    scale?: Vector3,
  ) {
    if (translation) {
      copyv3(this._rts.translation, translation);
    }
    if (rotation) {
      from_euler(this._rts.rotation, rotation[0], rotation[1], rotation[2]);
    }
    if (scale) {
      copyv3(this._rts.scale, scale);
    }
  }

  private _setupVao(gl: WebGL2RenderingContext): void {
    if (!this._vao) {
      this._vao = gl.createVertexArray()!;
    }
    gl.bindVertexArray(this._vao);
    setupAttributeBuffer(
      gl,
      this._material.shader,
      'pos',
      GL_ARRAY_BUFFER,
      this._isDynamic,
      this._mesh.vertices,
      3,
    );

    this._trianglesBuffer = gl.createBuffer()!;
    gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, this._trianglesBuffer);
    gl.bufferData(
      GL_ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this._mesh.triangles),
      this._isDynamic ? GL_DYNAMIC_DRAW : GL_STATIC_DRAW,
    );

    if (this._mesh.uvs.length > 0 && this._material.shader.has('uv')) {
      this._uvBuffer = setupAttributeBuffer(
        gl,
        this._material.shader,
        'uv',
        GL_ARRAY_BUFFER,
        this._isDynamic,
        this._mesh.uvs,
        2,
      );
    }

    if (this._mesh.normals.length > 0 && this._material.shader.has('normal')) {
      this._normalBuffer = setupAttributeBuffer(
        gl,
        this._material.shader,
        'normal',
        GL_ARRAY_BUFFER,
        this._isDynamic,
        this._mesh.normals,
        3,
      );
    }

    if (this._mesh.colors.length > 0 && this._material.shader.has('col')) {
      this._colorBuffer = setupAttributeBuffer(
        gl,
        this._material.shader,
        'col',
        GL_ARRAY_BUFFER,
        this._isDynamic,
        this._mesh.colors,
        4,
      );
    }
    gl.bindVertexArray(null);
  }

  public render(gl: WebGL2RenderingContext, camera: Camera) {
    this._material.shader.enable(gl);
    gl.bindVertexArray(this._vao);
    const mv = create();
    multiply(mv, this.w, camera.v);
    gl.uniformMatrix4fv(this._material.shader.mv, false, mv);
    gl.uniformMatrix4fv(this._material.shader.p, false, camera.p);
    gl.uniform1f(this._material.shader.u_mix, 0);

    gl.activeTexture(GL_TEXTURE0);
    gl.bindTexture(GL_TEXTURE_2D, this._texture);
    gl.activeTexture(GL_TEXTURE0);
    gl.uniform1i(this._material.shader.sampler, 0);

    gl.drawElements(
      GL_TRIANGLES,
      this._mesh.triangles.length,
      GL_DATA_UNSIGNED_SHORT,
      0,
    );
    gl.bindVertexArray(null);
  }

  public addChild(entity: Entity) {
    this._children.push(entity);
    entity._parent = this;
  }

  public removeChild(entity: Entity) {
    entity._parent = undefined;
    this._children = this._children.filter((c) => c.id !== entity.id);
  }

  public removeChildById(id: string) {
    const child = this._children.find((c) => c.id === id);
    if (!child) return;
    this.removeChild(child);
  }

  public updateWorldMatrix() {
    this._l = create();
    this._rts.getMatrix(this._l);
    if (this._parent) {
      multiply(this.w, this._l, this._parent.w);
    } else {
      copy(this.w, this._l);
    }
    this._children.forEach((c) => c.updateWorldMatrix());
  }
}
