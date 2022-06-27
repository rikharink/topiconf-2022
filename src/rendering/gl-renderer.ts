import settings, {
  defaultRendererSettings,
  defaultTextRendererOptions as defaultTextRendererSettings,
} from '../settings';
import { RendererSettings } from './renderer-settings';
import frag from './shaders/default.frag.glsl';
import vert from './shaders/triangle.vert.glsl';
import { initShaderProgram, Shader } from './gl-util';
import { TextRenderer, TextRendererSettings } from './text-renderer';
import { Scene } from '../game/scene';
import {
  GL_BLEND,
  GL_ONE,
  GL_ONE_MINUS_SRC_ALPHA,
  GL_SRC_ALPHA,
  GL_TEXTURE0,
  GL_TEXTURE2,
  GL_TEXTURE_2D,
  GL_TRIANGLE_FAN,
} from './gl-constants';

export class WebGL2Renderer {
  public gl!: WebGL2RenderingContext;
  public text_renderer: TextRenderer;
  private _shader!: Shader;
  public isDirty = true;

  public get canvas(): HTMLCanvasElement {
    return this.gl.canvas;
  }

  constructor(
    rendererSettings?: Partial<RendererSettings>,
    textRendererSettings?: Partial<TextRendererSettings>,
  ) {
    settings.rendererSettings = {
      ...defaultRendererSettings,
      ...rendererSettings,
    };

    settings.rendererSettings.textRendererSettings = {
      ...defaultTextRendererSettings,
      ...textRendererSettings,
    };
    this.setup();
    this.text_renderer = new TextRenderer(this.gl);
  }

  public setup() {
    let parent: HTMLElement | undefined | null;
    const c = document.getElementById('g');
    if (c) {
      parent = c.parentElement;
      c.remove();
    }
    const canvas = document.createElement('canvas');
    if (parent) {
      parent.appendChild(canvas);
    }
    canvas.id = 'g';
    this.gl = canvas.getContext('webgl2', {
      antialias: settings.rendererSettings.antialias,
    })!;
    const [width, height] = settings.rendererSettings.resolution;
    this.setAntialias();
    this.setResolution(width, height);
    this._shader = initShaderProgram(this.gl, vert, frag)!;
    this.gl.blendFuncSeparate(
      GL_SRC_ALPHA,
      GL_ONE_MINUS_SRC_ALPHA,
      GL_ONE,
      GL_ONE,
    );
    this.gl.enable(GL_BLEND);

    const color = settings.rendererSettings.clearColor;
    this.gl.clearColor(color[0], color[1], color[2], color[3]);
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

  public render(scene: Scene) {
    if (settings.rendererSettings.resizeToScreen) {
      this._resizeToScreen();
    }
    this._shader.enable(this.gl);
    this.gl.clear(settings.rendererSettings.clearMask);
    if (this.isDirty) {
      if (scene.bg_texture) {
        this.gl.activeTexture(GL_TEXTURE2);
        this.gl.bindTexture(GL_TEXTURE_2D, scene.bg_texture);
        this.gl.activeTexture(GL_TEXTURE0);
        this.gl.uniform1i(this._shader.sampler, 2);
      }
      this.isDirty = false;
    }

    this.gl.drawArrays(GL_TRIANGLE_FAN, 0, 3);
    this.text_renderer.render(scene);
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
