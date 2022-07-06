import { stats } from '../debug/gui';
import { DEGREE_TO_RADIAN } from '../math/util';
import { Camera } from '../rendering/camera/camera';
import { Camera3D } from '../rendering/camera/camera-3d';
import { PerspectiveCamera } from '../rendering/camera/perspective-camera';
import { WebGL2Renderer } from '../rendering/gl-renderer';
import settings from '../settings';
import { Milliseconds } from '../types';
import { InputManager } from './input-manager';
import { Scene } from './scene';

export class Game {
  private _running = true;
  private _handle = 0;
  private _then?: number;
  private _t = 0;
  private _accumulator = 0;
  private _input: InputManager;
  private _camera: Camera;
  public currentScene: Scene;
  public renderer: WebGL2Renderer;

  constructor(start: Scene, renderer: WebGL2Renderer) {
    this.renderer = renderer;
    this._input = new InputManager(this.renderer.gl.canvas);
    this.currentScene = start;
    this._camera = new PerspectiveCamera(
      90 * DEGREE_TO_RADIAN,
      settings.rendererSettings.resolution[0] /
        settings.rendererSettings.resolution[1],
      0.1,
      100,
    );
  }

  private _loop(now: Milliseconds) {
    this._ensureCorrectSlide();
    if (process.env.NODE_ENV === 'development' && stats.begin) {
      stats.begin();
    }
    this._handle = requestAnimationFrame(this._loop.bind(this));
    if (this._then) {
      const ft = now - this._then;
      if (ft > 1000) {
        this._then = now;
        return;
      }

      this._accumulator += ft;

      while (this._accumulator >= settings.dt) {
        this._t += settings.dt;
        //DO FIXED STEP STUFF
        this._accumulator -= settings.dt;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const alpha = this._accumulator / settings.dt;
      //DO VARIABLE STEP STUFF

      this._processInput();
      this.renderer.render(this.currentScene, this._camera);
    }
    this._then = now;
    if (process.env.NODE_ENV === 'development') {
      stats.end();
    }
  }

  private _ensureCorrectSlide() {
    const hash = Number(window.location.hash.slice(1));
    if (hash !== this.currentScene.id) {
      if (hash > this.currentScene.id) {
        while (this.currentScene.next && this.currentScene.id != hash) {
          this._setCurrentScene(this.currentScene.next);
        }
      } else {
        while (this.currentScene.previous && this.currentScene.id != hash) {
          this._setCurrentScene(this.currentScene.previous);
        }
      }
    }
  }

  private _setCurrentScene(scene: Scene) {
    this.currentScene = scene;
    this.renderer.text_renderer.isDirty = true;
    this.renderer.isDirty = true;
    window.location.hash = this.currentScene.id.toString();
  }

  private _processInput() {
    const next =
      this._input.hasKeyUp('ArrowRight') || this._input.hasPointerUp(0);
    if (next && this.currentScene.next) {
      this._setCurrentScene(this.currentScene.next);
    }

    const previous =
      this._input.hasKeyUp('ArrowLeft') || this._input.hasPointerUp(2);
    if (previous && this.currentScene.previous) {
      this._setCurrentScene(this.currentScene.previous);
    }

    this._input.tick();
  }

  public start() {
    this._running = true;
    this._handle = requestAnimationFrame(this._loop.bind(this));
  }

  public stop() {
    this._running = false;
    this._then = undefined;
    cancelAnimationFrame(this._handle);
  }

  public toggle() {
    this._running = !this._running;
    this._running ? this.start() : this.stop();
  }
}
