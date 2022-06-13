import {
  GL_COLOR_BUFFER_BIT,
  GL_DEPTH_BUFFER_BIT,
} from './rendering/gl-constants';
import { RendererSettings } from './rendering/renderer-settings';
import { TextRendererSettings } from './rendering/text-renderer';

export const defaultTextRendererOptions: TextRendererSettings = {
  scale: 128,
  halo: 0.75,
  angle: 0,
  gamma: 2,
  textColor: [1, 1, 1, 1],
  haloColor: [1, 1, 0, 1],
};

export const defaultRendererSettings: RendererSettings = {
  clearColor: [0, 0, 0, 1],
  clearMask: GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT,
  supportHiDpi: false,
  resizeToScreen: false,
  resolution: [2560, 1440],
  antialias: true,
  textRendererSettings: defaultTextRendererOptions,
};

const settings = {
  dt: 10,
  rendererSettings: defaultRendererSettings,
};

export default settings;
