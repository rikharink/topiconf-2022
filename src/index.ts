import './debug/gui';
import { showDebugGUI } from './debug/gui';
import { Game } from './game/game';
import { Scene } from './game/scene';
import { WebGL2Renderer } from './rendering/gl-renderer';
import { injectStyle } from './rendering/style';
import state from './state';
import slides from './slides.json';
import { EntityDescription, RgbColor, Slide } from './types';
import { hexToRgb } from './math/color';
import settings from './settings';
import { Entity } from './rendering/entities/entity';

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

function getEntity(e: EntityDescription): Entity {
  const entity = state.game!.entities.get(e.entityId);
  if (!entity) {
    throw Error(`entity with id ${e.entityId} was not found!`);
  }

  entity.transposition = e.position;
  entity.scale = e.scale;
  entity.rotation = e.rotation;

  return entity;
}

function getSlides(): Scene {
  const ls = slides as Slide[];
  const bg = ls[0].background;
  const clearColor = settings.rendererSettings.clearColor;
  const defaultColor: RgbColor = [
    clearColor[0] * 255,
    clearColor[1] * 255,
    clearColor[2] * 255,
  ];

  const first: Slide = slides[0] as Slide;
  const r = new Scene(
    renderer.gl,
    getText(first.text),
    bg?.map(hexToRgb) ?? [defaultColor],
    first.entities?.map(getEntity),
  );
  let p = r;
  for (const s of ls.slice(1)) {
    p = p.addNext(
      getText(s.text),
      s.background?.map(hexToRgb) ?? [defaultColor],
      s.entities?.map(getEntity),
    );
  }
  return r;
}
