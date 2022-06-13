import settings, { defaultRendererSettings } from '../settings';
import { RendererSettings } from './renderer-settings';
import frag from './default.frag.glsl';
import vert from './default.vert.glsl';
import { initShaderProgram, Shader } from './gl-util';
import { TextRenderer } from './text-renderer';

export class WebGL2Renderer {
  private gl!: WebGL2RenderingContext;
  public text_renderer: TextRenderer;
  private _shader!: Shader;

  public get canvas(): HTMLCanvasElement {
    return this.gl.canvas;
  }

  constructor(rendererSettings?: Partial<RendererSettings>) {
    settings.rendererSettings = {
      ...defaultRendererSettings,
      ...rendererSettings,
    };
    this.setupCanvas();
    this.text_renderer = new TextRenderer(this.gl);
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
    this.gl = canvas.getContext('webgl2', {
      antialias: settings.rendererSettings.antialias,
    })!;
    let [width, height] = settings.rendererSettings.resolution;
    this.setAntialias();
    this.setResolution(width, height);
    this._shader = initShaderProgram(this.gl, vert, frag)!;
  }

  public setResolution(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  public setAntialias(): void {
    if (settings.rendererSettings.antialias) {
      this.gl.canvas.classList.remove('no-aa');
      this.gl.canvas.classList.add('aa');
    } else {
      this.gl.canvas.classList.remove('aa');
      this.gl.canvas.classList.add('no-aa');
    }
  }

  public render() {
    if (settings.rendererSettings.resizeToScreen) {
      this._resizeToScreen();
    }
    const color = settings.rendererSettings.clearColor;
    this.gl.useProgram(this._shader.program);
    this.gl.clearColor(color[0], color[1], color[2], color[3]);
    this.gl.clear(settings.rendererSettings.clearMask);
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
