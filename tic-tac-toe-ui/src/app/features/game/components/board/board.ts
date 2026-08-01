import {
  ChangeDetectorRef,
  Component
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { Cell } from '../cell/cell';
import { GameService } from '../../services/game';
import { GameStatus } from '../../models/game-status';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    Cell
  ],
  template: `
    <div class="board-wrapper">
      <div class="board" *ngIf="game.gameState$ | async as state">
        <app-cell
          *ngFor="let cell of state.board; let i = index"
          [value]="cell"
          [highlight]="state.winningCombination?.includes(i)"
          (cellClick)="makeMove(i)">
        </app-cell>
      </div>

      <div class="buttons">

        <button
          class="undo"
          type="button"
          [disabled]="!canUndo"
          (click)="undo()">
          Undo Last Move
        </button>

        <button
          class="reset"
          type="button"
          (click)="resetGame()">
          Reset Game
        </button>

      </div>

      <div class="moves" *ngIf="(game.gameState$ | async)?.moves?.length">

        <h3>Move History</h3>

        <table>
          <thead>
            <tr>
              <th>Move</th>
              <th>Player</th>
              <th>Position</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let move of (game.gameState$ | async)?.moves">
              <td>{{ move.moveNumber }}</td>
              <td>{{ move.player }}</td>
              <td>{{ getPositionText(move.position) }}</td>
            </tr>
          </tbody>
        </table>

      </div>

    </div>
  `,
  styles: [`
    .board-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
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

    .buttons {
      display: flex;
      gap: 15px;
      margin-top: 20px;
    }

    button {
      padding: 10px 18px;
      font-size: 14px;
      border: 2px solid #00ffcc;
      border-radius: 6px;
      cursor: pointer;
      background: transparent;
      color: #00ffcc;
    }

    button:hover:not(:disabled) {
      background: #00ffcc;
      color: black;
    }

    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .moves {
      margin-top: 25px;
      width: 350px;
    }

    .moves h3 {
      margin-bottom: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      padding: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }
  `]
})
export class Board {

  readonly GameStatus = GameStatus;
  winningCells: number[] = [];
  constructor(
  public readonly game: GameService,
  private readonly cdr: ChangeDetectorRef
) {}

makeMove(position: number): void {
  if (!this.game.gameState$.value) {
    return;
  }

  if (this.game.gameState$.value.status !== GameStatus.InProgress) {
    return;
  }

  if (this.game.gameState$.value.board[position]) {
    return;
  }

  this.game.makeMove(position).subscribe({
  next: game => {
    console.log('Returned game', game);
    console.log('Service state', this.game.gameState$);
    console.log('Board value', this.game.gameState$.value?.board);
    if (game.winningCombination) {
      this.winningCells = game.winningCombination;
    }
    if (game.status !== GameStatus.InProgress) {
      this.game.getScoreboard().subscribe();
    }
    this.cdr.detectChanges();
  }
});
}

  undo(): void {
    this.game.undo().subscribe({
      error: error => {
        console.error('Failed to undo move', error);
      }
    });
  }

  resetGame(): void {
    this.winningCells = [];
    this.game.resetGame().subscribe({
      next: () => {
        this.game.getScoreboard().subscribe();
      },
      error: error => {
        console.error('Failed to reset game', error);
      }
    });
  }

  get canUndo(): boolean {
    const state = this.game.gameState$.value;

    if (!state) {
      return false;
    }

    if (state.status !== GameStatus.InProgress) {
      return false;
    }

    return state.moves.length > 0;
  }

  getPositionText(position: number): string {
    const row = Math.floor(position / 3) + 1;
    const column = (position % 3) + 1;

    return `Row ${row}, Column ${column}`;
  }
}