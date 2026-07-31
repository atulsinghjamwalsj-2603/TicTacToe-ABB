import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  cells: ('X' | 'O' | null)[] = Array(9).fill(null);
  currentPlayer: 'X' | 'O' = 'X';
  xScore = 0;
  oScore = 0;
  winner: string | null = null;
  winningCombo: number[] = [];

  makeMove(index: number) {
  if (this.cells[index] || this.winner) return;

  this.cells[index] = this.currentPlayer;

  const winner = this.checkWinner();

  if (winner) {
    this.winner = winner;

    if (winner === 'X') {
      this.xScore++;
    } else {
      this.oScore++;
    }

    return;
  }

  this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
}

  resetGame() {
  this.cells = Array(9).fill(null);
  this.currentPlayer = 'X';
  this.winningCombo = [];
  this.winner = null;
  }
 
  resetScore() {
  this.xScore = 0;
  this.oScore = 0;
}

checkWinner(): string | null {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (let combo of wins) {
    const [a, b, c] = combo;

    if (
      this.cells[a] &&
      this.cells[a] === this.cells[b] &&
      this.cells[a] === this.cells[c]
    ) {
      this.winningCombo = combo;
      return this.cells[a];
    }
  }

  return null;
}
}