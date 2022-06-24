import './debug/gui';
import { showDebugGUI } from './debug/gui';
import { Game } from './game/game';
import { Scene } from './game/scene';
import { WebGL2Renderer } from './rendering/gl-renderer';
import { injectStyle } from './rendering/style';
import state from './state';
import slides from './slides.json';

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
  const r = new Scene(getText(slides[0].text));
  let p = r;
  for (const s of slides.slice(1)) {
    p = p.addNext(getText(s.text));
  }
  return r;
}
