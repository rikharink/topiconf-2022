import { Entity } from '../rendering/entities/entity';
import { generateRampTexture } from '../rendering/textures/generate-textures';
import { RgbColor } from '../types';

export class Scene {
  public id = 0;
  public previous?: Scene;
  public next?: Scene;
  public text: string;
  public root?: Entity[];
  private _bg_colors?: RgbColor[];
  private _bg_texture?: WebGLTexture;
  private _gl: WebGL2RenderingContext;

  public get bg_colors(): RgbColor[] | undefined {
    return this._bg_colors;
  }

  public set bg_colors(value: RgbColor[] | undefined) {
    this._bg_colors = value;
    if (value) {
      this._bg_texture = generateRampTexture(this._gl, value);
    }
  }

  public get bg_texture() {
    return this._bg_texture;
  }

  public constructor(
    gl: WebGL2RenderingContext,
    text: string,
    background?: RgbColor[],
    entities?: Entity[],
    previous?: Scene,
  ) {
    this._gl = gl;
    this.text = text;
    this.root = entities;
    this.bg_colors = background;
    this.previous = previous;
  }

  public addNext(
    text: string,
    background?: RgbColor[],
    entities?: Entity[],
  ): Scene {
    const child = new Scene(this._gl, text, background, entities, this);
    child.id = this.id + 1;
    this.next = child;
    return child;
  }
}
