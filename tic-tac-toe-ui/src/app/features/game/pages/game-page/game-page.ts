import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { Board } from '../../components/board/board';
import { Status } from '../../components/status/status';
import { GameService } from '../../services/game';
import { GameMode } from '../../models/game-mode';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game-page',
  standalone: true,
  imports: [
    CommonModule,
    Board,
    Status,
    FormsModule
  ],
  template: `
    <h1 class="title">Tic Tac Toe</h1>

    <div class="mode-selector">
  <label for="gameMode">Game Mode:</label>

  <div class="dropdown-wrapper">
    <select
      id="gameMode"
      class="game-dropdown"
      [(ngModel)]="selectedMode"
      (change)="onModeChange($event)">

      <option [ngValue]="GameMode.TwoPlayer">
        👥 Two Player
      </option>

      <option [ngValue]="GameMode.VsComputer">
        🤖 Play Against Computer
      </option>

    </select>
  </div>
</div>

    <div class="scoreboard">
      <span class="x">
        X: {{ (game.scoreboard$ | async)?.xWins }}
      </span>

      <span class="o">
        O: {{ (game.scoreboard$ | async)?.oWins }}
      </span>

      <span class="draw">
        Draws: {{ (game.scoreboard$ | async)?.draws }}
      </span>
    </div>

    <app-status></app-status>

    <app-board></app-board>

    <div class="scoreboard-actions">
      <button
        type="button"
        (click)="resetScoreboard()">
        Reset Scoreboard
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      justify-content: flex-start;
      padding-top: 40px;
      min-height: 100vh;
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #1f1f1f, #3a3a3a);
      color: white;
    }

    .title {
      font-size: 36px;
      margin-bottom: 20px;
      letter-spacing: 2px;
      text-shadow: 0 0 10px rgba(255,255,255,0.4);
    }

    .mode-selector {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .mode-selector label {
      font-size: 18px;
    }

    .scoreboard {
      display: flex;
      gap: 30px;
      margin-bottom: 15px;
      font-size: 20px;
    }

    .scoreboard .x {
      color: #ff4d4d;
    }

    .scoreboard .o {
      color: #4da6ff;
    }

    .scoreboard .draw {
      color: #ffd166;
    }

    .scoreboard-actions {
      margin-top: 20px;
    }

    .scoreboard-actions button {
      padding: 10px 18px;
      border: 2px solid #ef476f;
      border-radius: 6px;
      background: transparent;
      color: #ef476f;
      cursor: pointer;
    }

    .scoreboard-actions button:hover {
      background: #ef476f;
      color: white;
    }
      .dropdown-wrapper {
  position: relative;
  display: inline-block;
}

.game-dropdown {
  appearance: none;
  padding: 10px 40px 10px 15px;
  font-size: 16px;
  border-radius: 10px;
  border: 2px solid transparent;
  outline: none;
  cursor: pointer;

  /* Dark background */
  background:
    linear-gradient(#2a2a2a, #2a2a2a) padding-box,
    linear-gradient(45deg, #00f5a0, #00d9f5, #b621fe) border-box;

  color: white;
  transition: all 0.3s ease;
}

/* Hover glow */
.game-dropdown:hover {
  box-shadow: 0 0 12px rgba(0, 255, 200, 0.6);
}

/* Focus glow */
.game-dropdown:focus {
  box-shadow: 0 0 16px rgba(182, 33, 254, 0.9);
}

/* Custom arrow */
.dropdown-wrapper::after {
  content: "▼";
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #00f5a0;
  pointer-events: none;
}
  `]
})
export class GamePage implements OnInit {

  readonly GameMode = GameMode;

  selectedMode = GameMode.TwoPlayer;

  constructor(
  public readonly game: GameService,
  private readonly cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    this.startGame(this.selectedMode);

    this.game.getScoreboard().subscribe();
  }

startGame(mode: GameMode): void {
  this.selectedMode = mode;

  this.game.createGame(mode).subscribe({
    next: () => {
      this.game.getScoreboard().subscribe({
        next: () => this.cdr.detectChanges(),
        error: error => {
          console.error('Failed to load scoreboard', error);
        }
      });
    },
    error: error => {
      console.error('Failed to create game', error);
    }
  });
}

  onModeChange(event: Event): void {
    this.startGame(this.selectedMode);
  }

  resetScoreboard(): void {
    this.game.resetScoreboard().subscribe({
      error: error => {
        console.error('Failed to reset scoreboard', error);
      }
    });
  }
}