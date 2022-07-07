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
import { Rectangle } from './rendering/entities/rectangle';

const renderer = new WebGL2Renderer({});
document.body.appendChild(renderer.gl.canvas);

const entities = new EntityStore();
entities.register(
  new Rectangle(renderer.gl, 'trl', [0, 0], [100, 35], 0),
  new Rectangle(renderer.gl, 'trd', [0, 0], [100, 35], 0),
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
  const entity = entities.get(e.id);
  if (!entity) {
    throw Error(`entity with id ${e.id} was not found!`);
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
