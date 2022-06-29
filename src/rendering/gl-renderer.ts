import settings, {
  defaultRendererSettings,
  defaultTextRendererOptions as defaultTextRendererSettings,
} from '../settings';
import { RendererSettings } from './renderer-settings';
import frag from './shaders/default.frag.glsl';
import vert from './shaders/triangle.vert.glsl';
import { initShaderProgram } from './gl-util';
import { Shader } from './shader';
import { TextRenderer, TextRendererSettings } from './text-renderer';
import { Scene } from '../game/scene';
import {
  GL_BLEND,
  GL_CULL_FACE,
  GL_DEPTH_BUFFER_BIT,
  GL_DEPTH_TEST,
  GL_LEQUAL,
  GL_ONE,
  GL_ONE_MINUS_SRC_ALPHA,
  GL_SRC_ALPHA,
  GL_TEXTURE0,
  GL_TEXTURE2,
  GL_TEXTURE_2D,
  GL_TRIANGLE_FAN,
} from './gl-constants';
import { Camera } from './camera/camera';
import { RgbaColor } from '../types';
import { arrayEquals } from '../util';

export class WebGL2Renderer {
  public gl: WebGL2RenderingContext;
  public text_renderer: TextRenderer;
  private _shader!: Shader;
  public isDirty = true;

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
    this.gl = this.setup();
    this.text_renderer = new TextRenderer(this.gl);
  }

  public setup(): WebGL2RenderingContext {
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
    const gl = canvas.getContext('webgl2', {
      antialias: settings.rendererSettings.antialias,
    })!;
    const [width, height] = settings.rendererSettings.resolution;
    this.setAntialias(gl);
    this.setResolution(gl, width, height);
    this._shader = initShaderProgram(gl, vert, frag)!;
    gl.blendFuncSeparate(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA, GL_ONE, GL_ONE);
    gl.enable(GL_BLEND);
    gl.enable(GL_CULL_FACE);
    gl.enable(GL_DEPTH_TEST);
    gl.depthFunc(GL_LEQUAL);

    const color = settings.rendererSettings.clearColor;
    gl.clearColor(color[0], color[1], color[2], color[3]);
    this.gl = gl;
    this.isDirty = true;
    return gl;
  }

  public setResolution(
    gl: WebGL2RenderingContext,
    width: number,
    height: number,
  ): void {
    gl.canvas.width = width;
    gl.canvas.height = height;
    gl.viewport(0, 0, width, height);
  }

  public setAntialias(gl: WebGL2RenderingContext): void {
    if (settings.rendererSettings.antialias) {
      gl.canvas.classList.remove('no-aa');
      gl.canvas.classList.add('aa');
    } else {
      gl.canvas.classList.remove('aa');
      gl.canvas.classList.add('no-aa');
    }
  }

  _prevColor?: RgbaColor;
  public render(scene: Scene, camera: Camera) {
    const gl = this.gl;
    if (settings.rendererSettings.resizeToScreen) {
      this._resizeToScreen(gl);
    }
    this._shader.enable(gl);
    const color = settings.rendererSettings.clearColor;
    if (!this._prevColor || !arrayEquals(color, this._prevColor)) {
      gl.clearColor(color[0], color[1], color[2], color[3]);
      this._prevColor = [...color];
    }
    gl.clear(settings.rendererSettings.clearMask | GL_DEPTH_BUFFER_BIT);
    this._renderBackground(gl, scene);
    this._renderEntities(gl, scene, camera);
    this._renderText(gl, scene);
  }

  private _renderBackground(gl: WebGL2RenderingContext, scene: Scene) {
    if (this.isDirty) {
      if (scene.bg_texture) {
        gl.activeTexture(GL_TEXTURE2);
        gl.bindTexture(GL_TEXTURE_2D, scene.bg_texture);
        gl.activeTexture(GL_TEXTURE0);
        gl.uniform1i(this._shader.sampler, 2);
      }
      this.isDirty = false;
    }
    gl.drawArrays(GL_TRIANGLE_FAN, 0, 3);
  }

  private _renderEntities(
    gl: WebGL2RenderingContext,
    scene: Scene,
    camera: Camera,
  ) {
    scene.root?.forEach((e) => {
      e.updateWorldMatrix();
      e.render(gl, camera.pv);
    });
  }

  private _renderText(gl: WebGL2RenderingContext, scene: Scene) {
    this.text_renderer.render(gl, scene);
  }

  private _resizeToScreen(gl: WebGL2RenderingContext): boolean {
    const dpr = settings.rendererSettings.supportHiDpi
      ? window.devicePixelRatio || 1
      : 1;
    const dw = gl.canvas.clientWidth * dpr;
    const dh = gl.canvas.clientHeight * dpr;

    if (gl.canvas.width !== dw || gl.canvas.height != dh) {
      this.setResolution(gl, dw, dh);
      return true;
    }
    return false;
  }
}
