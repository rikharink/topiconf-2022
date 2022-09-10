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
import { Vector2 } from '../math/vector2';

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
    if (!gl) throw Error("Browser doesn't support webgl2");
    const [width, height] = settings.rendererSettings.resolution;
    this.setAntialias(gl);
    this.setResolution(gl, width, height);
    this._shader = initShaderProgram(gl, vert, frag)!;
    gl.blendFuncSeparate(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA, GL_ONE, GL_ONE);
    gl.enable(GL_BLEND);
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
    this._shader.enable(gl);
    const color = settings.rendererSettings.clearColor;
    if (!this._prevColor || !arrayEquals(color, this._prevColor)) {
      gl.clearColor(color[0], color[1], color[2], color[3]);
      this._prevColor = [...color];
    }
    gl.clear(settings.rendererSettings.clearMask | GL_DEPTH_BUFFER_BIT);
    this._renderBackground(gl, scene);
    this._renderEntities(gl, scene, camera);
  }

  public renderText(scene: Scene, secondCanvasPosition?: Vector2) {
    this._renderText(this.gl, scene, secondCanvasPosition);
  }

  private _renderBackground(gl: WebGL2RenderingContext, scene: Scene) {
    if (this.isDirty) {
      if (scene.bg_texture) {
        gl.activeTexture(GL_TEXTURE2);
        gl.bindTexture(GL_TEXTURE_2D, scene.bg_texture);
        gl.activeTexture(GL_TEXTURE0);
      }
      this.isDirty = false;
    }

    if (scene.bg_texture) {
      gl.uniform1f(this._shader.u_mix, 0);
      gl.uniform1i(this._shader.sampler, 2);
    } else {
      gl.uniform1f(this._shader.u_mix, 1);
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
      e.render(gl, camera);
    });
  }

  private _renderText(
    gl: WebGL2RenderingContext,
    scene: Scene,
    secondCanvasPosition?: Vector2,
  ) {
    this.text_renderer.render(gl, scene, secondCanvasPosition);
  }
}
