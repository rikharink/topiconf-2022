import { Entity } from '../rendering/entities/entity';
import { generateRampTexture } from '../rendering/textures/generate-textures';
import { RgbColor } from '../types';

export class Scene {
  public previous?: Scene;
  public next?: Scene;
  public text: string;
  public entities?: Entity[];
  private _bg_colors: RgbColor[];
  private _bg_texture?: WebGLTexture;
  private _gl: WebGL2RenderingContext;

  public get bg_colors() {
    return this._bg_colors;
  }

  public set bg_colors(value: RgbColor[]) {
    this._bg_colors = value;
    this._bg_texture = generateRampTexture(this._gl, value);
  }

  public get bg_texture() {
    return this._bg_texture;
  }

  public constructor(
    gl: WebGL2RenderingContext,
    text: string,
    background: RgbColor[],
    entities?: Entity[],
    previous?: Scene,
    next?: Scene,
  ) {
    this._gl = gl;
    this.text = text;
    this.entities = entities;
    this.bg_colors = this._bg_colors = background;
    this.previous = previous;
    this.next = next;
  }

  public addNext(
    text: string,
    background: RgbColor[],
    entities?: Entity[],
  ): Scene {
    const child = new Scene(
      this._gl,
      text.toUpperCase(),
      background,
      entities,
      this,
    );
    this.next = child;
    return child;
  }
}
