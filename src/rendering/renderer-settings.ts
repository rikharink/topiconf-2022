import { NormalizedRgbaColor, Resolution, RgbaColor } from '../types';

export interface RendererSettings {
  textColor: NormalizedRgbaColor;
  haloColor: NormalizedRgbaColor;
  clearColor: NormalizedRgbaColor;
  clearMask: number;
  resolution: Resolution;
  supportHiDpi: boolean;
  resizeToScreen: boolean;
  antialias: boolean;
}
