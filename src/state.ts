import { Game } from './game/game';

interface State {
  game?: Game;
  text?: string;
}

const state: State = {
  game: undefined,
};

export default state;
