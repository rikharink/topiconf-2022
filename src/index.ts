import './debug/gui';
import { showDebugGUI } from './debug/gui';
import { Game } from './game/game';
import { Scene } from './game/scene';
import { WebGL2Renderer } from './rendering/gl-renderer';
import { injectStyle } from './rendering/style';
import state from './state';

injectStyle();
const renderer = new WebGL2Renderer({});
document.body.appendChild(renderer.canvas);
state.game = new Game(getSlides(), renderer);
state.game.start();

if (process.env.NODE_ENV === 'development') {
  showDebugGUI();
}

function getSlides(): Scene {
  var root = new Scene("JS13K: LET'S BUILD A TINY GAME!");
  root.addNext("WHAT IS JS13K?")
      .addNext("THE RULES:\n\n * IT HAS TO BE A WEBGAME\n* ZIPPED NO BIGGER THAN 13KB")
      .addNext("STEP 0: PROJECT SETUP");
  return root;
}
