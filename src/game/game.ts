import { stats } from '../debug/gui';
import { WebGL2Renderer } from '../rendering/gl-renderer';
import settings from '../settings';
import { Milliseconds } from '../types';
import { InputManager } from './input-manager';
import { Scene } from './scene';

export class Game {
  private _running: boolean = true;
  private _handle: number = 0;
  private _then?: number;
  private _t: number = 0;
  private _accumulator: number = 0;
  private _input: InputManager;
  public currentScene: Scene;

  constructor(startScene: Scene, public renderer: WebGL2Renderer) {
    this._input = new InputManager(this.renderer.canvas);
    this.currentScene = startScene;
  }

  loop(now: Milliseconds) {
    if (process.env.NODE_ENV === 'development') {
      stats.begin();
    }
    this._handle = requestAnimationFrame(this.loop.bind(this));
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

      const alpha = this._accumulator / settings.dt;
      //DO VARIABLE STEP STUFF

      this._processInput();
      this.renderer.render(this.currentScene);
    }
    this._then = now;
    if (process.env.NODE_ENV === 'development') {
      stats.end();
    }
  }

  private _processInput() {
    const next =
      this._input.hasKeyUp('ArrowRight') || this._input.hasPointerUp(0);
    if (next && this.currentScene.next) {
      this.currentScene = this.currentScene.next;
      this.renderer.text_renderer.isDirty = true;
    }

    const previous =
      this._input.hasKeyUp('ArrowLeft') || this._input.hasPointerUp(2);
    if (previous && this.currentScene.previous) {
      this.currentScene = this.currentScene.previous;
      this.renderer.text_renderer.isDirty = true;
    }

    this._input.tick();
  }

  public start() {
    this._running = true;
    this._handle = requestAnimationFrame(this.loop.bind(this));
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
