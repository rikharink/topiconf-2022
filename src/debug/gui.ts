import { TAU } from '../math/util';
import settings from '../settings';
import state from '../state';

const debugMenus = {
  showSpector: true,
  showStats: false,
};

async function showDebugGUI() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const controls = new lil.GUI();
  if (!controls.addFolder) {
    return;
  }
  const gameControls = controls.addFolder('game');
  gameControls.add(settings, 'dt', 10, 100, 1);

  const markDirty = function () {
    state.game!.renderer.text_renderer.isDirty = true;
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
  const aac = renderingControls.add(
    settings.rendererSettings,
    'antialias',
    true,
  );
  aac.onChange(function () {
    state.game!.renderer.setup();
  });
  renderingControls.add(
    settings.rendererSettings,
    'supportHiDpi',
    settings.rendererSettings.supportHiDpi,
  );

  renderingControls.add(
    settings.rendererSettings,
    'resizeToScreen',
    settings.rendererSettings.resizeToScreen,
  );
  renderingControls.addColor(settings.rendererSettings, 'clearColor');

  const debugControls = controls.addFolder('debug menus');

  //Spector.JS
  const spector = debugControls.add(
    debugMenus,
    'showSpector',
    debugMenus.showSpector,
  );
  spector.onChange(function (v: boolean) {
    showSpectorGUI(v);
  });
  createSpectorGUI();
  setTimeout(() => showSpectorGUI(debugMenus.showSpector), 100);

  //Stats.js
  const stats = debugControls.add(
    debugMenus,
    'showStats',
    debugMenus.showStats,
  );
  stats.onChange(function (v: boolean) {
    showStatsGUI(v);
  });
  createStatsGUI();
  showStatsGUI(debugMenus.showStats);
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
  spector.spyCanvas(state.game!.renderer.canvas);
  spector.displayUI();
}

export { stats, showDebugGUI };
