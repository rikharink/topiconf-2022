import { stats } from '../debug/gui';
import { DEGREE_TO_RADIAN } from '../math/util';
import { Camera } from '../rendering/camera/camera';
import { PerspectiveCamera } from '../rendering/camera/perspective-camera';
import { CanvasRenderer } from '../rendering/canvas-renderer';
import { WebGL2Renderer } from '../rendering/gl-renderer';
import settings from '../settings';
import { Milliseconds } from '../types';
import {
  CanvasScene,
  cloneCanvasScene,
  interpolateCanvasScene,
} from './canvas-scene';
import { InputManager } from './input-manager';
import { Scene } from './scene';
import canvasScenes from './canvas-scenes';

export class Game {
  private _running = true;
  private _handle = 0;
  private _then = 0;
  private _accumulator = 0;
  private _input: InputManager;
  private _camera: Camera;
  public currentScene: Scene;
  public currentCanvasScene?: CanvasScene;
  public renderer: WebGL2Renderer;
  public canvasRenderer: CanvasRenderer;
  private _previousCanvasScene?: CanvasScene;
  scenes: Scene[];

  constructor(
    start: Scene,
    scenes: Scene[],
    renderer: WebGL2Renderer,
    canvasRenderer: CanvasRenderer,
  ) {
    this.scenes = scenes;
    this.canvasRenderer = canvasRenderer;
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

    const ft = now - this._then;
    if (ft > 1000) {
      this._then = now;
      return;
    }

    this._accumulator += ft;

    while (this._accumulator >= settings.dt) {
      //DO FIXED STEP STUFF
      if (this.currentCanvasScene) {
        this._previousCanvasScene = cloneCanvasScene(this.currentCanvasScene);
        this.currentCanvasScene.updateTick(
          this.currentCanvasScene,
          settings.dt / 1000,
        );
      }
      this._accumulator -= settings.dt;
    }
    const alpha = this._accumulator / settings.dt;
    //DO VARIABLE STEP STUFF
    this._processInput();
    this.renderer.render(this.currentScene, this._camera);
    if (this.currentCanvasScene) {
      const canvasScene = this._previousCanvasScene
        ? interpolateCanvasScene(
            this._previousCanvasScene,
            this.currentCanvasScene,
            alpha,
          )
        : this.currentCanvasScene;
      this.canvasRenderer.render(canvasScene);
    }
    this.renderer.renderText(
      this.currentScene,
      this.currentCanvasScene?.position,
    );

    this._then = now;
    if (process.env.NODE_ENV === 'development') {
      stats.end();
    }
  }

  private _ensureCorrectSlide() {
    const hash = Number(window.location.hash.slice(1));
    if (hash === this.currentScene.id) {
      return;
    }

    const s = this.scenes.find((f) => f.id === hash);
    if (s) {
      this._setCurrentScene(s);
    }
  }

  private _getCanvasSceneById(id?: string): CanvasScene | undefined {
    if (!id) return undefined;
    const og = canvasScenes.find((cs) => cs.id === id);
    if (og) {
      return cloneCanvasScene(og);
    }
  }

  private _setCurrentScene(scene: Scene) {
    this.currentScene = scene;
    if (this.currentCanvasScene) {
      this.canvasRenderer.ctx.clearRect(
        0,
        0,
        this.canvasRenderer.canvas.width,
        this.canvasRenderer.canvas.height,
      );
    }
    this.currentCanvasScene = this._getCanvasSceneById(scene.canvasSceneId);
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

    //TODO: make to be controlled by the canvas scene instead of here
    if (this.currentCanvasScene?.player) {
      if (this._input.hasKeyDown('d')) {
        this.currentCanvasScene.right(this.currentCanvasScene);
      }
      if (this._input.hasKeyDown('a')) {
        this.currentCanvasScene.left(this.currentCanvasScene);
      }
      if (this._input.hasKeyUp('w')) {
        this.currentCanvasScene.up(this.currentCanvasScene);
      }
      if (this._input.hasKeyUp('s')) {
        this.currentCanvasScene.down(this.currentCanvasScene);
      }
    }

    this._input.tick();
  }

  public start() {
    this._running = true;
    this._handle = requestAnimationFrame(this._loop.bind(this));
  }

  public stop() {
    this._running = false;
    this._then = 0;
    cancelAnimationFrame(this._handle);
  }

  public toggle() {
    this._running = !this._running;
    this._running ? this.start() : this.stop();
  }
}
