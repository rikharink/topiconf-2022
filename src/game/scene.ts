import { generateRampTexture } from '../rendering/textures/generate-textures';
import { NormalizedRgbColor } from '../types';

export class Scene {
  public previous?: Scene;
  public next?: Scene;
  public text: string;
  private _bg_colors?: NormalizedRgbColor[];
  private _bg_texture?: WebGLTexture;
  private _gl: WebGL2RenderingContext;

  public get bg_colors() {
    return this._bg_colors;
  }

  public set bg_colors(value: NormalizedRgbColor[] | undefined) {
    this._bg_colors = value;
    if (value) {
      this._bg_texture = generateRampTexture(this._gl, value);
    } else {
      this._bg_texture = undefined;
    }
  }

  public get bg_texture() {
    return this._bg_texture;
  }

  public constructor(
    gl: WebGL2RenderingContext,
    text: string,
    background?: NormalizedRgbColor[],
    previous?: Scene,
    next?: Scene,
  ) {
    this._gl = gl;
    this.text = text;
    this.bg_colors = background;
    this.previous = previous;
    this.next = next;
  }

  public addNext(text: string, background?: NormalizedRgbColor[]): Scene {
    const child = new Scene(this._gl, text.toUpperCase(), background, this);
    this.next = child;
    return child;
  }
}
