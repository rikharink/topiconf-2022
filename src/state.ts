import { Game } from './game/game';

interface State {
  game?: Game;
  text?: string;
}

const state: State = {
  game: undefined,
  text: 'Hello World!',
};

export default state;
