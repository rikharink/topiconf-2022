import './debug/gui';
import { showDebugGUI } from './debug/gui';
import { Game } from './game/game';
import { Scene } from './game/scene';
import { WebGL2Renderer } from './rendering/gl-renderer';
import { injectStyle } from './rendering/style';
import state from './state';
import slides from './slides.json';
import { NormalizedRgbColor, Slide } from './types';
import { hexToNormalizedRgb } from './math/color';
import settings from './settings';

injectStyle();
const renderer = new WebGL2Renderer({});
document.body.appendChild(renderer.canvas);
state.game = new Game(getSlides(), renderer);
state.game.start();

if (process.env.NODE_ENV === 'development') {
  showDebugGUI();
}

function getText(text: string | string[]) {
  return Array.isArray(text) ? text.join('\n') : text;
}

function getSlides(): Scene {
  const ls = slides as Slide[];
  const bg = ls[0].background;
  const clearColor = settings.rendererSettings.clearColor;
  const defaultColor: NormalizedRgbColor = [
    clearColor[0],
    clearColor[1],
    clearColor[2],
  ];
  const r = new Scene(
    renderer.gl,
    getText(slides[0].text),
    bg?.map(hexToNormalizedRgb) ?? [defaultColor],
  );
  let p = r;
  for (const s of ls.slice(1)) {
    p = p.addNext(
      getText(s.text),
      s.background?.map(hexToNormalizedRgb) ?? [defaultColor],
    );
  }
  return r;
}
