import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameService } from '../../services/game';
import { GameStatus } from '../../models/game-status';
import { GameMode } from '../../models/game-mode';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="status"
      *ngIf="(game.gameState$ | async) as state">

      <ng-container [ngSwitch]="state.status">

        <div *ngSwitchCase="GameStatus.InProgress">
          <span *ngIf="state.mode === GameMode.TwoPlayer">
            Current Player: {{ state.currentPlayer }}
          </span>

          <span *ngIf="state.mode === GameMode.VsComputer">
            <span *ngIf="state.currentPlayer === 'X'">
              Your Turn
            </span>

            <span *ngIf="state.currentPlayer === 'O'">
              Computer's Turn
            </span>
          </span>
        </div>

        <div *ngSwitchCase="GameStatus.Won">
          🎉 Winner: {{ state.winner }}
        </div>

        <div *ngSwitchCase="GameStatus.Draw">
          🤝 Game Draw!
        </div>

      </ng-container>

    </div>
  `,
  styles: [`
    .status {
      margin-bottom: 20px;
      font-size: 20px;
      font-weight: bold;
      min-height: 30px;
    }
  `]
})
export class Status {

  readonly GameStatus = GameStatus;
  readonly GameMode = GameMode;

  constructor(public readonly game: GameService) {}
}