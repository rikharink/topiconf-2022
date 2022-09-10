import { CanvasScene } from '../game/canvas-scene';
import { add, Vector2 } from '../math/vector2';
import settings from '../settings';

export class CanvasRenderer {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public borderWidth: number;

  constructor(borderWidth = 4) {
    const canvas = document.createElement('canvas');
    const [width, height] = settings.rendererSettings.resolution;
    canvas.id = 'c';
    canvas.width = width;
    canvas.height = height;
    canvas.classList.add('aa');
    this.ctx = canvas.getContext('2d')!;
    this.canvas = canvas;
    this.borderWidth = borderWidth;
  }

  public render(scene: CanvasScene) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const [x, y] = scene.position!;
    const [w, h] = scene.size;
    ctx.fillStyle = scene.bg;
    ctx.fillRect(x, y, w, h);
    ctx.lineWidth = this.borderWidth;
    ctx.strokeStyle = 'black';
    ctx.strokeRect(
      x - this.borderWidth * 0.5,
      y - this.borderWidth * 0.5,
      w + this.borderWidth,
      h + this.borderWidth,
    );
    this._renderPlayer(scene, [x, y]);
  }

  private _renderPlayer(scene: CanvasScene, topLeftCanvas: Vector2) {
    if (!scene.player) return;

    const ctx = this.ctx;
    ctx.fillStyle = scene.player.color;
    const playerPos = this._translatePosition(scene.player.pos, topLeftCanvas);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.fillRect(
      playerPos[0],
      playerPos[1],
      scene.player.size[0],
      scene.player.size[1],
    );
    ctx.strokeRect(
      playerPos[0],
      playerPos[1],
      scene.player.size[0],
      scene.player.size[1],
    );
  }

  private _translatePosition(position: Vector2, topLeftCanvas: Vector2) {
    return add([0, 0], position, topLeftCanvas);
  }
}
