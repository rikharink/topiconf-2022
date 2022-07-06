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
import { Quad } from './rendering/meshes/quad';
import { DefaultMaterial } from './rendering/materials/default-material';
import { Triangle } from './rendering/meshes/triangle';
import { Box } from './rendering/meshes/box';
import { UVMaterial } from './rendering/materials/uv-material';
import { CoordMaterial } from './rendering/materials/coord-material';
import { TextMaterial } from './rendering/materials/text-material';

const renderer = new WebGL2Renderer({});
document.body.appendChild(renderer.gl.canvas);

const entities = new EntityStore();
entities.register(
  new Entity(renderer.gl, 'q1', new Quad(), new DefaultMaterial(renderer.gl)),
  new Entity(renderer.gl, 't1', new Triangle(), new UVMaterial(renderer.gl)),
  new Entity(renderer.gl, 'b1', new Box(), new UVMaterial(renderer.gl)),
);

state.game = new Game(getSlides(), renderer);
state.game.start();

if (process.env.NODE_ENV === 'development') {
  showDebugGUI();
}

function getText(text: string | string[] | Line[]): Line[] {
  if (Array.isArray(text)) {
    if (text.length === 0) return [];
    if (typeof text[0] === 'object') {
      return text as Line[];
    } else {
      return (text as string[]).map((t) => {
        return {
          text: t,
        };
      });
    }
  }
  return [{ text: text }];
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
  const first: Slide = slides[0] as Slide;
  const r = new Scene(
    renderer.gl,
    getText(first.text),
    first.textAlignment,
    first.textColor,
    first.haloColor,
    bg?.map(hexToRgb),
    first.entities?.map(getEntity),
  );
  let p = r;
  for (const s of ls.slice(1)) {
    p = p.addNext(
      getText(s.text),
      s.textAlignment,
      s.textColor,
      s.haloColor,
      s.background?.map(hexToRgb),
      s.entities?.map(getEntity),
    );
  }
  return r;
}
