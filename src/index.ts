import './debug/gui';
import { showDebugGUI } from './debug/gui';
import { Game } from './game/game';
import { Scene } from './game/scene';
import { WebGL2Renderer } from './rendering/gl-renderer';
import state from './state';
import slides from './slides.json';
import { EntityDescription, Line, Slide } from './types';
import { hexToRgb } from './math/color';
import { Entity } from './rendering/entities/entity';
import { EntityStore } from './rendering/entities/entity-store';
import { Corner, Rectangle } from './rendering/entities/rectangle';
import { CanvasRenderer } from './rendering/canvas-renderer';

const renderer = new WebGL2Renderer({});
const canvasRenderer = new CanvasRenderer();
document.body.appendChild(renderer.gl.canvas);
document.body.appendChild(canvasRenderer.canvas);

const entities = new EntityStore();
entities.register(
  new Rectangle(renderer.gl, 'trl', [0, 0], [100, 35], 0),
  new Rectangle(renderer.gl, 'trd', [0, 0], [100, 35], 0),
  new Corner(renderer.gl, 'tc', [0, 0], [100, 35], 0),
);

const scenes: Scene[] = getScenes();
state.game = new Game(scenes[0], scenes, renderer, canvasRenderer);
state.game.start();

if (process.env.NODE_ENV === 'development') {
  showDebugGUI();
}

function getText(text: string | (string | Line)[]): Line[] {
  if (Array.isArray(text)) {
    return text.map((l) => (typeof l == 'object' ? l : { text: l }));
  }
  return [{ text: text }];
}

function getEntity(e: EntityDescription): Entity {
  const entity = entities.get(e.id);
  if (!entity) {
    throw Error(`entity with id ${e.id} was not found!`);
  }
  entity.updateTRS(e.translation, e.rotation, e.scale);
  return entity;
}

function getScenes(): Scene[] {
  const scenes: Scene[] = [];
  const ls = slides as Slide[];
  const bg = ls[0].background;
  const first: Slide = slides[0] as Slide;
  const r = new Scene(
    renderer.gl,
    getText(first.text),
    first.textAlignment,
    first.textVerticalAlignment,
    first.textColor,
    first.haloColor,
    bg?.map(hexToRgb),
    first.entities?.map(getEntity),
    undefined,
    first.canvasSceneId,
    first.angle,
    first.font,
  );
  let p = r;
  scenes.push(r);
  for (const s of ls.slice(1)) {
    p = p.addNext(
      getText(s.text),
      s.textAlignment,
      s.textVerticalAlignment,
      s.textColor,
      s.haloColor,
      s.background?.map(hexToRgb),
      s.entities?.map(getEntity),
      s.canvasSceneId,
      s.angle,
      s.font,
    );
    scenes.push(p);
  }
  return scenes;
}
