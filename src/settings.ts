import { DebugSettings } from './debug/gui';
import { getRandom } from './math/random';
import {
  GL_COLOR_BUFFER_BIT,
  GL_DEPTH_BUFFER_BIT,
} from './rendering/gl-constants';
import { RendererSettings } from './rendering/renderer-settings';
import { TextRendererSettings } from './rendering/text-renderer';

export const yellow = '#F19A13';
export const red = '#E74043';
export const purple = '#982A7C';
export const blue = '#00A0E3';

export const defaultTextRendererOptions: TextRendererSettings = {
  scale: 76,
  halo: 0.64,
  angle: 0,
  gamma: 2,
  textColor: [0, 0, 0, 1],
  //haloColor: [152 / 255, 42 / 255, 124 / 255, 1],
  haloColor: [1, 1, 1, 1],
  fontFamily: '"JetBrainsMono Nerd Font", monospace',
  lineHeight: 1.2,
  letterSpacing: 0,
};

export const defaultRendererSettings: RendererSettings = {
  clearColor: [1, 1, 1, 1],
  clearMask: GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT,
  resolution: [1920, 1080],
  antialias: true,
  textRendererSettings: defaultTextRendererOptions,
};

export const defaultDebugSettings: DebugSettings = {
  showSpector: false,
  showStats: false,
};

const settings = {
  dt: 5,
  gravity: [0, 5000],
  flapVelocity: 1000,
  pipeWidth: 100,
  pipeOpeningSize: 200,
  minPipeHeight: 100,
  pipeMovementspeed: 2,
  pipeSpawnPercentage: 0.65,
  rng: getRandom('TOPICONF2022'),
  rendererSettings: defaultRendererSettings,
  debugSettings: defaultDebugSettings,
};

export default settings;
