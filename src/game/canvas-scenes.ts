import { clamp } from '../math/util';
import { add, scale, subtract, Vector2 } from '../math/vector2';
import settings, { blue, purple, yellow } from '../settings';
import {
  CanvasScene,
  getNextPipe,
  hasPipeCollision,
  PhysicsObject,
  Pipe,
  Player,
} from './canvas-scene';

let currentId = 1;
let pipeId = 0;
function physicsTick(po: PhysicsObject, dt: number) {
  add(po.velocity, po.velocity, scale([0, 0], po.acceleration, dt));
  add(po.pos, po.pos, scale([0, 0], po.velocity, dt));
}

function boundsCheck(c: CanvasScene, killPlayer = true) {
  if (!c.player) return;

  const top = c.position[1];
  const bottom = c.position[1] + c.size[1] - c.player.size[1];
  const left = c.position[0];
  const right = c.position[0] + c.size[0] - c.player.size[0];

  if (c.player.pos[1] < top) {
    c.player.acceleration[1] = 0;
    c.player.velocity[1] = 0;
    c.player.pos[1] = top;
  }

  if (c.player.pos[1] > bottom) {
    c.player.acceleration[1] = 0;
    c.player.velocity[1] = 0;
    c.player.pos[1] = bottom;
    if (killPlayer) {
      c.player.isDead = true;
    }
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

  if (hasPipeCollision(c)) {
    c.player.acceleration = [0, 0];
    c.player.velocity = [0, 0];
    if (killPlayer) {
      c.player.isDead = true;
    }
  }
}

function noopUpdateTick(): void {
  return;
}

function outOfBoundsTick(c: CanvasScene, dt: number): void {
  if (!c.player) return;
  c.player.acceleration = [c.gravity[0], c.gravity[1]];
  physicsTick(c.player, dt);
}

function spawnPipe(c: CanvasScene): void {
  const px = c.position[0] + c.size[0] + settings.pipeWidth;
  const size = clamp(
    settings.minPipeHeight + settings.pipeOpeningSize * 0.5,
    c.size[1] - settings.minPipeHeight - settings.pipeOpeningSize * 0.5,
    c.size[1],
  );
  const py =
    c.position[1] + settings.rng() * size + 0.5 * settings.pipeOpeningSize;
  c.pipes.push({
    id: pipeId++,
    pos: [px, py],
    color: purple,
    hasSpawned: false,
  });
}

function pipeTick(c: CanvasScene) {
  if (c.player?.isDead === true) {
    return;
  }

  //MOVE PIPES
  for (const pipe of c.pipes) {
    pipe.pos[0] -= settings.pipeMovementspeed;
  }

  //SPAWN PIPES
  const sx = c.position[0] + c.size[0] * settings.pipeSpawnPercentage;
  if (c.pipes.length === 0) {
    spawnPipe(c);
  } else {
    let frontPipe: Pipe | undefined;
    for (let i = 0; i < c.pipes.length; i++) {
      if (c.pipes[i].hasSpawned) continue;
      frontPipe = c.pipes[i];
      break;
    }

    if (!frontPipe) return;
    if (frontPipe.pos[0] < sx && !frontPipe.hasSpawned) {
      frontPipe.hasSpawned = true;
      spawnPipe(c);
    }
  }

  //KILL PIPES
  const kx = c.position[0] - settings.pipeWidth * 0.5;
  c.pipes = c.pipes.filter((pipe) => pipe.pos[0] > kx);
}

function noPipesUpdateTick(c: CanvasScene, dt: number): void {
  if (!c.player) return;
  c.player.acceleration = [c.gravity[0], c.gravity[1]];
  physicsTick(c.player, dt);
  boundsCheck(c, false);
}

let previousNextPipe: Pipe | undefined = undefined;
function defaultUpdateTick(c: CanvasScene, dt: number): void {
  if (!c.player || !c.hasStarted) return;
  c.player.fitness++;
  c.player.acceleration = [c.gravity[0], c.gravity[1]];
  physicsTick(c.player, dt);
  pipeTick(c);
  boundsCheck(c);

  const nextPipe = getNextPipe(c);
  if (nextPipe && previousNextPipe && nextPipe.id != previousNextPipe.id) {
    c.score++;
  }
  previousNextPipe = nextPipe;
}

function defaultUp(scene: CanvasScene) {
  scene.hasStarted = true;
  if (!scene.player || scene.player.isDead) return;
  if (scene.gravity[1] !== 0) {
    scene.player.velocity[1] =
      Math.sign(-scene.gravity[1]) * scene.flapVelocity;
  } else if (scene.gravity[0] !== 0) {
    scene.player.velocity[0] =
      Math.sign(-scene.gravity[0]) * scene.flapVelocity;
  }
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
    bg: blue,
    size: size,
    position: position,
    topMargin: topMargin,
    player: getDefaultPlayer(size, position),
    pipes: [],
    hasStarted: false,
    gravity: <Vector2>settings.gravity,
    flapVelocity: settings.flapVelocity,
    score: 0,
    shouldRenderScore: true,
  };
}

function getDefaultPlayer(
  screenSize: Vector2,
  screenPosition: Vector2,
): Player {
  const size: Vector2 = [48, 64];
  const halfSize = scale([0, 0], size, 0.5);
  const halfScreenSize = scale([0, 0], screenSize, 0.5);
  const pos = subtract([0, 0], halfScreenSize, halfSize);
  add(pos, pos, screenPosition);
  return {
    flap: defaultUp,
    pos: pos,
    size: [50, 50],
    acceleration: [0, 0],
    velocity: [0, 0],
    color: yellow,
    rotation: 0,
    isDead: false,
    fitness: 0,
  };
}

const scenes: CanvasScene[] = [
  {
    ...getDefaultScene(),
    player: undefined,
    shouldRenderScore: false,
  },
  {
    ...getDefaultScene(),
    updateTick: noopUpdateTick,
    shouldRenderScore: false,
  },
  {
    ...getDefaultScene(),
    updateTick: outOfBoundsTick,
    gravity: [0, 500],
    flapVelocity: 250,
    shouldRenderScore: false,
  },
  {
    ...getDefaultScene(),
    updateTick: noPipesUpdateTick,
    gravity: [0, 1000],
    flapVelocity: 500,
    shouldRenderScore: false,
  },
  {
    ...getDefaultScene(),
    id: 'FLAPPYSQUARE',
  },
];

export default scenes;
