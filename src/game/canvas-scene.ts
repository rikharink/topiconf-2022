import { rgbToHex, hexToRgb } from '../math/color';
import { lerp } from '../math/util';
import { Vector2, lerp as vlerp } from '../math/vector2';
import { lerp as v3lerp } from '../math/vector3';
import { Radian, Seconds } from '../types';

export type CanvasUpdateTick = (scene: CanvasScene, dt: Seconds) => void;
export type CanvasMovementFunction = (scene: CanvasScene) => void;

export interface CanvasScene {
  id: string;
  updateTick: CanvasUpdateTick;
  up: CanvasMovementFunction;
  down: CanvasMovementFunction;
  left: CanvasMovementFunction;
  right: CanvasMovementFunction;
  bg: string;
  size: Vector2;
  position: Vector2;
  leftMargin?: number;
  topMargin?: number;
  player?: Player;
  pipes: Pipe[];
}

export interface PhysicsObject {
  pos: Vector2;
  acceleration: Vector2;
  velocity: Vector2;
}

export interface Pipe {
  openingHeight: number;
  pos: Vector2;
}

export interface Player extends PhysicsObject {
  size: Vector2;
  color: string;
  rotation: Radian;
}

function interpolatePlayer(
  start: Player | undefined,
  end: Player | undefined,
  t: number,
): Player | undefined {
  if (!start) return end;
  if (!end) return start;
  return {
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
    pos: vlerp([0, 0], start.pos, end.pos, t),
    openingHeight: lerp(start.openingHeight, end.openingHeight, t),
  };
}

export function interpolateCanvasScene(
  start: CanvasScene,
  end: CanvasScene,
  t: number,
): CanvasScene {
  return {
    ...end,
    player: interpolatePlayer(start?.player, end?.player, t),
  };
}

export function cloneCanvasScene(s: CanvasScene): CanvasScene {
  const c: CanvasScene = JSON.parse(JSON.stringify(s));
  c.updateTick = s.updateTick;
  c.up = s.up;
  c.down = s.down;
  c.left = s.left;
  c.right = s.right;
  return c;
}
