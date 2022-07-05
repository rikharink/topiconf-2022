import './debug/gui';
import { showDebugGUI } from './debug/gui';
import { Game } from './game/game';
import { Scene } from './game/scene';
import { WebGL2Renderer } from './rendering/gl-renderer';
import { injectHead } from './inject';
import state from './state';
import slides from './slides.json';
import { EntityDescription, RgbColor, Slide } from './types';
import { hexToRgb } from './math/color';
import settings from './settings';
import { Entity } from './rendering/entities/entity';
import { EntityStore } from './rendering/entities/entity-store';
import { Quad } from './rendering/meshes/quad';
import { DefaultMaterial } from './rendering/materials/default-material';
import { Triangle } from './rendering/meshes/triangle';
import { Box } from './rendering/meshes/box';
import { UVMaterial } from './rendering/materials/uv-material';

injectHead();
const renderer = new WebGL2Renderer({});
document.body.appendChild(renderer.gl.canvas);

const entities = new EntityStore();
const defaultMaterial = new DefaultMaterial(renderer.gl);
const uvMaterial = new UVMaterial(renderer.gl);
entities.register(
  new Entity(renderer.gl, 'q1', new Quad(), uvMaterial),
  new Entity(renderer.gl, 't1', new Triangle(), defaultMaterial),
  new Entity(renderer.gl, 'b1', new Box(), defaultMaterial),
);

state.game = new Game(getSlides(), renderer);
state.game.start();

if (process.env.NODE_ENV === 'development') {
  showDebugGUI();
}

function getText(text: string | string[]) {
  return Array.isArray(text) ? text.join('\n') : text;
}

function getEntity(e: EntityDescription): Entity {
  const entity = entities.get(e.entityId);
  if (!entity) {
    throw Error(`entity with id ${e.entityId} was not found!`);
  }
  entity.updateTRS(e.translation, e.rotation, e.scale);
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
    bg?.map(hexToRgb),
    first.entities?.map(getEntity),
  );
  let p = r;
  for (const s of ls.slice(1)) {
    p = p.addNext(
      getText(s.text),
      s.background?.map(hexToRgb),
      s.entities?.map(getEntity),
    );
  }
  return r;
}
