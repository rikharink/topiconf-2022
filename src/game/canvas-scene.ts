import { rgbToHex, hexToRgb } from '../math/color';
import { lerp } from '../math/util';
import { Vector2, lerp as vlerp } from '../math/vector2';
import { lerp as v3lerp } from '../math/vector3';
import settings from '../settings';
import { Radian, Seconds } from '../types';

export type CanvasUpdateTick = (scene: CanvasScene, dt: Seconds) => void;
export type CanvasMovementFunction = (scene: CanvasScene) => void;

export interface CanvasScene {
  id: string;
  updateTick: CanvasUpdateTick;
  bg: string;
  size: Vector2;
  position: Vector2;
  leftMargin?: number;
  topMargin?: number;
  player?: Player;
  pipes: Pipe[];
  hasStarted: boolean;
  gravity: Vector2;
  flapVelocity: number;
  score: number;
  shouldRenderScore: boolean;
  killPlayer: boolean;
}

export interface PhysicsObject {
  pos: Vector2;
  acceleration: Vector2;
  velocity: Vector2;
}

export interface Pipe {
  id: number;
  pos: Vector2;
  color: string;
  hasSpawned: boolean;
}

export interface Player extends PhysicsObject {
  size: Vector2;
  color: string;
  rotation: Radian;
  isDead: boolean;
  flap: CanvasMovementFunction;
  fitness: number;
}

function interpolatePlayer(
  start: Player | undefined,
  end: Player | undefined,
  t: number,
): Player | undefined {
  if (!start) return end;
  if (!end) return start;
  return {
    ...end,
    pos: vlerp([0, 0], start.pos, end.pos, t),
    size: vlerp([0, 0], start.size, end.size, t),
    acceleration: vlerp([0, 0], start.acceleration, end.acceleration, t),
    velocity: vlerp([0, 0], start.acceleration, end.acceleration, t),
    color: rgbToHex(
      v3lerp([0, 0, 0], hexToRgb(start.color), hexToRgb(end.color), t),
    ),
    rotation: lerp(start.rotation, end.rotation, t),
  };
}

function interpolatePipe(start: Pipe, end: Pipe, t: number): Pipe {
  return {
    id: lerp(start.id, end.id, t),
    pos: vlerp([0, 0], start.pos, end.pos, t),
    color: rgbToHex(
      v3lerp([0, 0, 0], hexToRgb(start.color), hexToRgb(end.color), t),
    ),
    hasSpawned: false,
  };
}

export function interpolateCanvasScene(
  start: CanvasScene,
  end: CanvasScene,
  t: number,
): CanvasScene {
  const startPipes = start.pipes.sort((a, b) => a.id - b.id);
  const endPipes = end.pipes.sort((a, b) => a.id - b.id);
  const pipes: Pipe[] = [];
  let i = 0;
  while (
    i < startPipes.length &&
    !endPipes.find((p) => p.id === startPipes[i].id)
  ) {
    pipes.push(startPipes[i]);
    i++;
  }
  while (i < startPipes.length && i < endPipes.length) {
    const sp = startPipes[i];
    const ep = endPipes.find((p) => p.id === sp.id);
    if (!ep) {
      break;
    }
    pipes.push(interpolatePipe(sp, ep, t));
    i++;
  }
  while (i < endPipes.length) {
    pipes.push(endPipes[i]);
    i++;
  }

  return {
    ...end,
    player: interpolatePlayer(start?.player, end?.player, t),
    pipes,
  };
}

export function cloneCanvasScene(s: CanvasScene): CanvasScene {
  const c: CanvasScene = JSON.parse(JSON.stringify(s));
  c.updateTick = s.updateTick;
  if (s.player) {
    c.player!.flap = s.player.flap;
  }
  return c;
}

export function getNextPipe(scene: CanvasScene): Pipe | undefined {
  if (!scene.player || scene.player.isDead) return;
  const playerPos = scene.player.pos;
  for (const pipe of scene.pipes) {
    const pipePos = pipe.pos;
    if (pipePos[0] + settings.pipeWidth < playerPos[0]) {
      continue;
    }
    return pipe;
  }
}

export function hasPipeCollision(scene: CanvasScene): boolean {
  if (!scene.player) return false;
  const playerPos = scene.player.pos;
  const relevantPipe = getNextPipe(scene);
  if (!relevantPipe) return false;

  const pipeStartX = relevantPipe.pos[0] - settings.pipeWidth * 0.5;
  const pipeEndX = relevantPipe.pos[0] + settings.pipeWidth * 0.5;
  const pipeTopY = relevantPipe.pos[1] - settings.pipeOpeningSize * 0.5;
  const pipeBottomY = relevantPipe.pos[1] + settings.pipeOpeningSize * 0.5;

  const playerStartX = playerPos[0];
  const playerEndX = playerPos[0] + scene.player.size[0];
  const playerTopY = playerPos[1];
  const playerBottomY = playerPos[1] + scene.player.size[1];

  if (playerEndX < pipeStartX || playerStartX > pipeEndX) return false;
  return playerTopY <= pipeTopY || playerBottomY >= pipeBottomY;
}
