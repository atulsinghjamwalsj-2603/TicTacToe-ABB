import { Component } from '@angular/core';
import { Board } from '../../components/board/board';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game';

@Component({
  selector: 'app-game-page',
  standalone: true,
  imports: [Board, CommonModule],
  template: `
    <h1 class="title">Tic Tac Toe</h1>
    
    <div class="scoreboard">
      <span class="x">X: {{ game.xScore }}</span>
      <span class="o">O: {{ game.oScore }}</span>
    </div>
    <app-board></app-board>    
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
  height: 100vh;
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
  `]
})
export class GamePage {
   constructor(public game: GameService) {}
}