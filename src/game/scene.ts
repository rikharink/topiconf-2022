import { Entity } from '../rendering/entities/entity';
import { generateRampTexture } from '../rendering/textures/generate-textures';
import { Line, NormalizedRgbaColor, RgbColor } from '../types';

export const enum TextAlignment {
  Left = 'Left',
  Center = 'Center',
}

export const enum TextVerticalAlignment {
  Top = 'Top',
  Center = 'Center',
}

export class Scene {
  public id = 0;
  public previous?: Scene;
  public next?: Scene;
  public text: Line[];
  public textAlignment: TextAlignment;
  public textVerticalAlignment: TextVerticalAlignment;
  public textColor?: NormalizedRgbaColor;
  public haloColor?: NormalizedRgbaColor;
  public root?: Entity[];
  public canvasSceneId?: string;
  public angle?: number;
  public font?: string;
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
    text: Line[],
    textAlignment = TextAlignment.Center,
    textVerticalAlignment = TextVerticalAlignment.Center,
    textColor?: NormalizedRgbaColor,
    haloColor?: NormalizedRgbaColor,
    background?: RgbColor[],
    entities?: Entity[],
    previous?: Scene,
    canvasSceneId?: string,
    angle?: number,
    font?: string,
  ) {
    this._gl = gl;
    this.text = text;
    this.textAlignment = textAlignment;
    this.textVerticalAlignment = textVerticalAlignment;
    this.textColor = textColor;
    this.haloColor = haloColor;
    this.root = entities;
    this.bg_colors = background;
    this.previous = previous;
    this.canvasSceneId = canvasSceneId;
    this.angle = angle;
    this.font = font;
  }

  public addNext(
    text: Line[],
    textAlignment = TextAlignment.Center,
    textVerticalAlignment = TextVerticalAlignment.Center,
    textColor?: NormalizedRgbaColor,
    haloColor?: NormalizedRgbaColor,
    background?: RgbColor[],
    entities?: Entity[],
    canvasSceneId?: string,
    angle?: number,
    font?: string,
  ): Scene {
    const child = new Scene(
      this._gl,
      text,
      textAlignment,
      textVerticalAlignment,
      textColor,
      haloColor,
      background,
      entities,
      this,
      canvasSceneId,
      angle,
      font,
    );
    child.id = this.id + 1;
    this.next = child;
    return child;
  }
}
