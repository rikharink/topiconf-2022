import { DebugSettings } from './debug/gui';
import {
  GL_COLOR_BUFFER_BIT,
  GL_DEPTH_BUFFER_BIT,
} from './rendering/gl-constants';
import { RendererSettings } from './rendering/renderer-settings';
import { TextRendererSettings } from './rendering/text-renderer';

export const defaultTextRendererOptions: TextRendererSettings = {
  scale: 128,
  halo: 0.64,
  angle: 0,
  gamma: 2,
  textColor: [1, 1, 1, 1],
  haloColor: [152 / 255, 42 / 255, 124 / 255, 1],
  fontFamily: '"JetBrainsMono Nerd Font", monospace',
  lineHeight: 1.2,
  letterSpacing: 0,
};

export const defaultRendererSettings: RendererSettings = {
  clearColor: [0, 0, 0, 1],
  clearMask: GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT,
  supportHiDpi: false,
  resizeToScreen: false,
  resolution: [1920, 1080],
  antialias: true,
  textRendererSettings: defaultTextRendererOptions,
};

export const defaultDebugSettings: DebugSettings = {
  showSpector: false,
  showStats: false,
};

const settings = {
  dt: 10,
  rendererSettings: defaultRendererSettings,
  debugSettings: defaultDebugSettings,
};

export default settings;
