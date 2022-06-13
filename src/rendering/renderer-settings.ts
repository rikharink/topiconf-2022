import { NormalizedRgbaColor, Resolution } from '../types';
import { TextRendererSettings } from './text-renderer';

export interface RendererSettings {
  clearColor: NormalizedRgbaColor;
  clearMask: number;
  resolution: Resolution;
  supportHiDpi: boolean;
  resizeToScreen: boolean;
  antialias: boolean;
  textRendererSettings: TextRendererSettings;
}
