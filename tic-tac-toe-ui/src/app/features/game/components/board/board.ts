import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cell } from '../cell/cell';
import { GameService } from '../../services/game';


@Component({
  
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, Cell],
  template: `
<h2 *ngIf="game.winner" class="winner">
  🎉 Winner: {{ game.winner }}
</h2>
<div class="board-wrapper">
    <div class="board">
      <app-cell
  *ngFor="let cell of game.cells; let i = index"
  [value]="cell"
  [isWinner]="game.winningCombo.includes(i)"
  (cellClick)="game.makeMove(i)">
</app-cell>
    </div>
<div class="buttons">
  <button class="reset" (click)="game.resetGame()">
    Reset Board
  </button>

  <button class="reset-score" (click)="game.resetScore()">
    Reset Score
  </button>
</div>
    
</div>
  `,
  styles: [`
  h2 {
    margin-bottom: 10px;
  }

.board {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  gap: 10px;
  padding: 15px;

  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);

  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.board-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.reset, .reset-score {
  padding: 10px 18px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}

/* Board reset */
.reset {
  background: #ffd166;
  color: #222;
}

.reset:hover {
  background: #ffb703;
}

/* Score reset */
.reset-score {
  background: #ef476f;
  color: white;
}

.reset-score:hover {
  background: #d62839;
}
  .buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}
button {
  margin-top: 15px;
  background: transparent;
  border: 2px solid #00ffcc;
  color: #00ffcc;
}

button:hover {
  background: #00ffcc;
  color: black;
}
.winner {
  color: #00ffcc;
  text-shadow: 0 0 10px #00ffcc;
}
`]
})
export class Board {
  constructor(public game: GameService) {}

}