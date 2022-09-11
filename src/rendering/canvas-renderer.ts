import { CanvasScene, Pipe } from '../game/canvas-scene';
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
    ctx.lineWidth = this.borderWidth;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(
      x - this.borderWidth * 0.5,
      y - this.borderWidth * 0.5,
      w + this.borderWidth,
      h + this.borderWidth,
    );

    for (const pipe of scene.pipes) {
      this._renderPipe(scene, pipe);
    }
    this._renderPlayer(scene);
    this._renderScore(scene);
  }

  private _renderPipe(scene: CanvasScene, pipe: Pipe) {
    const ctx = this.ctx;
    const top = scene.position[1];
    const bottom = scene.size[1] + top;
    const pipeX = pipe.pos[0] - settings.pipeWidth * 0.5;
    const minX = scene.position[0];
    const maxX = scene.position[0] + scene.size[0] - settings.pipeWidth;

    let dw = 0;
    if (pipeX < minX) {
      dw = minX - pipeX;
    }
    if (pipeX > maxX) {
      dw = pipeX - maxX;
    }
    const w = Math.max(0, settings.pipeWidth - dw);
    const x = Math.max(pipeX, minX);
    const cy = pipe.pos[1];
    const p1y = cy - settings.pipeOpeningSize * 0.5;
    const p2y = p1y + settings.pipeOpeningSize;

    ctx.fillStyle = pipe.color;
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.rect(x, top, w, p1y - top);
    ctx.fill();
    if (pipeX < maxX) {
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.rect(x, p2y, w, bottom - p2y);
    ctx.fill();
    if (pipeX < maxX) {
      ctx.stroke();
    }
  }

  private _renderPlayer(scene: CanvasScene) {
    if (!scene.player) return;

    const ctx = this.ctx;
    ctx.fillStyle = scene.player.color;
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.rect(
      scene.player.pos[0],
      scene.player.pos[1],
      scene.player.size[0],
      scene.player.size[1],
    );
    ctx.fill();
    ctx.stroke();
  }

  private _renderScore(scene: CanvasScene) {
    const ctx = this.ctx;
    const score = scene.score;
    ctx.font = `bold 48px ${settings.rendererSettings.textRendererSettings.fontFamily}`;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    const text = score.toString();
    const x = scene.position[0] + scene.size[0] * 0.5;
    const y = scene.position[1] + 25 + 48;

    ctx.fillText(text, x, y);
    ctx.strokeText(text, x, y);
  }
}
