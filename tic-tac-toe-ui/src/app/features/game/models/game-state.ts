import { GameMode } from './game-mode';
import { GameStatus } from './game-status';
import { Move } from './move';

export interface GameState {
  id: string;
  board: (('X' | 'O') | null)[];
  currentPlayer: 'X' | 'O';
  status: GameStatus;
  winner: 'X' | 'O' | null;
  mode: GameMode;
  moves: Move[];
  winningCombination: number[];
}