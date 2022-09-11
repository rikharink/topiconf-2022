import { TAU } from '../math/util';
import { Vector2 } from '../math/vector2';
import settings from '../settings';
import state from '../state';

export interface DebugSettings {
  showSpector: boolean;
  showStats: boolean;
}

async function showDebugGUI() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const controls = new lil.GUI({ width: 375 });
  controls.close();
  if (!controls.addFolder) {
    return;
  }
  const gameControls = controls.addFolder('game');
  gameControls.add(settings, 'dt', 1, 1000, 1);
  const fv = gameControls.add(settings, 'flapVelocity', 0, 10000, 100);
  fv.onChange((v: number) => {
    if (state.game?.currentCanvasScene) {
      state.game.currentCanvasScene.flapVelocity = v;
    }
  });

  const gravity = {
    gravityX: settings.gravity[0],
    gravityY: settings.gravity[1],
  };

  const gx = gameControls.add(gravity, 'gravityX', -5000, 5000);
  gx.onChange((x: number) => {
    if (state.game?.currentCanvasScene) {
      state.game.currentCanvasScene.gravity[0] = x;
    }
  });
  const gy = gameControls.add(gravity, 'gravityY', -5000, 5000);
  gy.onChange((y: number) => {
    if (state.game?.currentCanvasScene) {
      state.game.currentCanvasScene.gravity[1] = y;
    }
  });

  const markDirty = function () {
    state.game!.renderer.text_renderer.isDirty = true;
    state.game!.renderer.isDirty = true;
  };

  const textControls = controls.addFolder('text');
  const scale = textControls.add(
    settings.rendererSettings.textRendererSettings,
    'scale',
    16,
    256,
    1,
  );
  scale.onChange(markDirty);

  textControls.add(
    settings.rendererSettings.textRendererSettings,
    'halo',
    0,
    1,
    0.01,
  );

  textControls.add(
    settings.rendererSettings.textRendererSettings,
    'angle',
    -TAU,
    TAU,
    0.01,
  );

  textControls.add(
    settings.rendererSettings.textRendererSettings,
    'gamma',
    0,
    10,
    0.01,
  );
  textControls.addColor(
    settings.rendererSettings.textRendererSettings,
    'textColor',
  );
  textControls.addColor(
    settings.rendererSettings.textRendererSettings,
    'haloColor',
  );

  const ff = textControls.add(
    settings.rendererSettings.textRendererSettings,
    'fontFamily',
  );
  ff.onChange(function () {
    state.game!.renderer.text_renderer.isSdfDirty = true;
  });

  const lh = textControls.add(
    settings.rendererSettings.textRendererSettings,
    'lineHeight',
    0.8,
    2.0,
  );

  lh.onChange(markDirty);
  const ls = textControls.add(
    settings.rendererSettings.textRendererSettings,
    'letterSpacing',
    -10,
    100,
  );
  ls.onChange(markDirty);

  const renderingControls = controls.addFolder('rendering');
  const clearColor = renderingControls.addColor(
    settings.rendererSettings,
    'clearColor',
  );
  clearColor.onChange(markDirty);

  const debugControls = controls.addFolder('debug menus');

  //Spector.JS
  const spector = debugControls.add(
    settings.debugSettings,
    'showSpector',
    settings.debugSettings.showSpector,
  );
  spector.onChange(function (v: boolean) {
    showSpectorGUI(v);
  });
  createSpectorGUI();
  setTimeout(() => showSpectorGUI(settings.debugSettings.showSpector), 100);

  //Stats.js
  const stats = debugControls.add(
    settings.debugSettings,
    'showStats',
    settings.debugSettings.showStats,
  );
  stats.onChange(function (v: boolean) {
    showStatsGUI(v);
  });
  createStatsGUI();
  showStatsGUI(settings.debugSettings.showStats);
}

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-var
  var stats = new Stats();
  // eslint-disable-next-line no-var
  var spector: SPECTOR.Spector;
}

function showStatsGUI(isVisible: boolean) {
  stats.dom.style.display = isVisible ? 'block' : 'none';
}

function showSpectorGUI(isVisible: boolean) {
  const ele = document.querySelector('.captureMenuComponent')!.parentElement!;
  ele.style.display = isVisible ? 'block' : 'none';
}

function createStatsGUI() {
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
}

function createSpectorGUI() {
  spector = new SPECTOR.Spector();
  spector.spyCanvas(state.game!.renderer.gl.canvas);
  spector.displayUI();
}

export { stats, showDebugGUI };
