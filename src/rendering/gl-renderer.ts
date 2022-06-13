import settings, { defaultRendererSettings } from '../settings';
import { RendererSettings } from './renderer-settings';
import frag from './default.frag.glsl';
import vert from './default.vert.glsl';
import { initShaderProgram, Shader } from './gl-util';
import TinySDF from './tinysdf';

export class WebGL2Renderer {
  private _ctx!: WebGL2RenderingContext;
  public text_renderer: TinySDF;
  private _shader!: Shader;

  public get canvas(): HTMLCanvasElement {
    return this._ctx.canvas;
  }

  constructor(rendererSettings?: Partial<RendererSettings>) {
    settings.rendererSettings = {
      ...defaultRendererSettings,
      ...rendererSettings,
    };
    this.setupCanvas();
    this.text_renderer = new TinySDF(this._ctx);
    this.text_renderer.text = 'Hello World!';
  }

  public setupCanvas() {
    let parent: HTMLElement | undefined | null;
    const c = document.getElementById('g');
    if (c) {
      parent = c.parentElement;
      c.remove();
    }
    let canvas = document.createElement('canvas');
    if (parent) {
      parent.appendChild(canvas);
    }
    canvas.id = 'g';
    this._ctx = canvas.getContext('webgl2', {
      antialias: settings.rendererSettings.antialias,
    })!;
    let [width, height] = settings.rendererSettings.resolution;
    this.setAntialias();
    this.setResolution(width, height);
    this._shader = initShaderProgram(this._ctx, vert, frag)!;
  }

  public setResolution(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this._ctx.viewport(0, 0, width, height);
  }

  public setAntialias(): void {
    if (settings.rendererSettings.antialias) {
      this._ctx.canvas.classList.remove('no-aa');
      this._ctx.canvas.classList.add('aa');
    } else {
      this._ctx.canvas.classList.remove('aa');
      this._ctx.canvas.classList.add('no-aa');
    }
  }

  public render() {
    if (settings.rendererSettings.resizeToScreen) {
      this._resizeToScreen();
    }
    const color = settings.rendererSettings.clearColor;
    this._ctx.useProgram(this._shader.program);
    this._ctx.clearColor(color[0], color[1], color[2], color[3]);
    this._ctx.clear(settings.rendererSettings.clearMask);
    this.text_renderer.render();
  }

  private _resizeToScreen(): boolean {
    const dpr = settings.rendererSettings.supportHiDpi
      ? window.devicePixelRatio || 1
      : 1;
    const dw = this.canvas.clientWidth * dpr;
    const dh = this.canvas.clientHeight * dpr;

    if (this.canvas.width !== dw || this.canvas.height != dh) {
      this.setResolution(dw, dh);
      return true;
    }
    return false;
  }
}
