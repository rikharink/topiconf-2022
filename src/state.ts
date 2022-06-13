import { Game } from './game/game';

interface State {
  game?: Game;
  text?: string;
}

const state: State = {
  game: undefined,
  text: 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz-_-\nLets build a Tiny Game!!!',
};

export default state;
