import { add, scale, subtract, Vector2 } from '../math/vector2';
import settings, { blue, yellow } from '../settings';
import { CanvasScene, PhysicsObject, Player } from './canvas-scene';

let currentId = 1;
function physicsTick(po: PhysicsObject, dt: number) {
  add(po.velocity, po.velocity, scale([0, 0], po.acceleration, dt));
  add(po.pos, po.pos, scale([0, 0], po.velocity, dt));
}

function boundsCheck(c: CanvasScene) {
  if (!c.player) return;

  const top = 0;
  const bottom = c.size[1] - c.player.size[1];
  const left = 0;
  const right = c.size[0] - c.player.size[0];

  if (c.player.pos[1] < top) {
    c.player.acceleration[1] = 0;
    c.player.velocity[1] = 0;
    c.player.pos[1] = top;
  }

  if (c.player.pos[1] > bottom) {
    c.player.acceleration[1] = 0;
    c.player.velocity[1] = 0;
    c.player.pos[1] = bottom;
  }

  if (c.player.pos[0] < left) {
    c.player.acceleration[0] = 0;
    c.player.velocity[0] = 0;
    c.player.pos[0] = left;
  }

  if (c.player.pos[0] > right) {
    c.player.acceleration[0] = 0;
    c.player.velocity[0] = 0;
    c.player.pos[0] = right;
  }
}

function noopUpdateTick(): void {
  return;
}

function outOfBoundsTick(c: CanvasScene, dt: number): void {
  if (!c.player) return;
  c.player.acceleration = [settings.gravity[0], settings.gravity[1]];
  physicsTick(c.player, dt);
}

function defaultUpdateTick(c: CanvasScene, dt: number): void {
  if (!c.player) return;
  c.player.acceleration = [settings.gravity[0], settings.gravity[1]];
  physicsTick(c.player, dt);
  boundsCheck(c);
}

function defaultUp(scene: CanvasScene) {
  if (!scene.player) return;
  if (settings.gravity[1] !== 0) {
    scene.player.velocity[1] =
      Math.sign(-settings.gravity[1]) * settings.flapVelocity;
  } else if (settings.gravity[0] !== 0) {
    scene.player.velocity[0] =
      Math.sign(-settings.gravity[0]) * settings.flapVelocity;
  }
}

function defaultDown(scene: CanvasScene) {
  if (!scene.player) return;
}

function defaultLeft(scene: CanvasScene) {
  if (!scene.player) return;
}

function defaultRight(scene: CanvasScene) {
  if (!scene.player) return;
}

function getDefaultScene(): CanvasScene {
  const size: Vector2 = [1280, 720];
  const topMargin = 100;
  const hs = scale([0, 0], settings.rendererSettings.resolution, 0.5);
  const hc = scale([0, 0], size, 0.5);
  const position: Vector2 = [0, 0];
  add(position, subtract([0, 0], hs, hc), [0, topMargin]);
  return {
    id: `c${currentId++}`,
    updateTick: defaultUpdateTick,
    up: defaultUp,
    down: defaultDown,
    left: defaultLeft,
    right: defaultRight,
    bg: blue,
    size: size,
    position: position,
    topMargin: topMargin,
    player: getDefaultPlayer(size),
    pipes: [],
  };
}

function getDefaultPlayer(screenSize: Vector2): Player {
  const size: Vector2 = [48, 64];
  const halfSize = scale([0, 0], size, 0.5);
  const halfScreenSize = scale([0, 0], screenSize, 0.5);
  const pos = subtract([0, 0], halfScreenSize, halfSize);

  return {
    pos: pos,
    size: [48, 48],
    acceleration: [0, 0],
    velocity: [0, 0],
    color: yellow,
    rotation: 0,
  };
}

const scenes: CanvasScene[] = [
  {
    ...getDefaultScene(),
    player: undefined,
  },
  {
    ...getDefaultScene(),
    updateTick: noopUpdateTick,
  },
  {
    ...getDefaultScene(),
    updateTick: outOfBoundsTick,
  },
  {
    ...getDefaultScene(),
  },
];

export default scenes;
