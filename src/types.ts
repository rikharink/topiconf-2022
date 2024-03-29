import { TextAlignment, TextVerticalAlignment } from './game/scene';
import { Vector2 } from './math/vector2';
import { Vector3 } from './math/vector3';

export type Milliseconds = number;
export type Seconds = number;
export type Bpm = number;
export type Radian = number;
export type Degree = number;
export type RgbaColor = [r: number, g: number, b: number, a: number];
export type NormalizedRgbaColor = RgbaColor;
export type RgbColor = [r: number, g: number, b: number];
export type NormalizedRgbColor = RgbColor;
export type HslColor = [h: number, s: number, l: number];
export type Percentage = number;
export type Random = () => number;
export type UUIDV4 = string;
export type Point2D = Vector2;
export type Point3D = Vector3;
export type Resolution = [width: number, height: number];

export type EntityDescription = {
  id: string;
  translation?: Vector3;
  rotation?: [Radian, Radian, Radian];
  scale?: Vector3;
};

export type Line = {
  text: string;
  scale?: number;
  relativeScale?: number;
};

export type Slide = {
  text: string | (string | Line)[];
  textAlignment?: TextAlignment;
  textVerticalAlignment?: TextVerticalAlignment;
  textColor?: NormalizedRgbaColor;
  haloColor?: NormalizedRgbaColor;
  background?: string[];
  entities?: EntityDescription[];
  canvasSceneId?: string;
  angle?: number;
  font?: string;
};
