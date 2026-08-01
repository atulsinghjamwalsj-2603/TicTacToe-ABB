import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject  } from 'rxjs';

import { GameMode } from '../models/game-mode';
import { GameState } from '../models/game-state';
import { Scoreboard } from '../models/scoreboard';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private readonly apiUrl = 'http://localhost:5273/api';

  gameState$ = new BehaviorSubject<GameState | null>(null);

  scoreboard$ = new BehaviorSubject<Scoreboard>({
    xWins: 0,
    oWins: 0,
    draws: 0
  });

  constructor(private readonly http: HttpClient) {}

  createGame(mode: GameMode): Observable<GameState> {
    return this.http
      .post<GameState>(`${this.apiUrl}/games`, { mode })
      .pipe(
        tap(game => this.gameState$.next(game))
      );
  }

  getGame(): Observable<GameState> {
    if (!this.gameState$.value) {
      throw new Error('No active game exists.');
    }

    return this.http
      .get<GameState>(`${this.apiUrl}/games/${this.gameState$.value.id}`)
      .pipe(
        tap(game => {
  this.gameState$.next(game);
})
      );
  }

  makeMove(position: number): Observable<GameState> {
    if (!this.gameState$.value) {
      throw new Error('No active game exists.');
    }

    return this.http
      .post<GameState>(
        `${this.apiUrl}/games/${this.gameState$.value.id}/moves`,
        {
          player: this.gameState$.value.currentPlayer,
          position
        }
      )
      .pipe(
        tap(game => {
  this.gameState$.next(game);
})
      );
  }

  undo(): Observable<GameState> {
    if (!this.gameState$.value) {
      throw new Error('No active game exists.');
    }

    return this.http
      .post<GameState>(
        `${this.apiUrl}/games/${this.gameState$.value.id}/undo`,
        {}
      )
      .pipe(
        tap(game => {
  this.gameState$.next(game);
})
      );
  }

  resetGame(): Observable<GameState> {
    if (!this.gameState$.value) {
      throw new Error('No active game exists.');
    }

    return this.http
      .post<GameState>(
        `${this.apiUrl}/games/${this.gameState$.value.id}/reset`,
        {}
      )
      .pipe(
        tap(game => {
  this.gameState$.next(game);
})
      );
  }

  getScoreboard(): Observable<Scoreboard> {
    return this.http
      .get<Scoreboard>(`${this.apiUrl}/scoreboard`)
      .pipe(
        tap(scoreboard => {
          this.scoreboard$.next(scoreboard);
        })
      );
  }

  resetScoreboard(): Observable<void> {
    return this.http
      .post<void>(
        `${this.apiUrl}/scoreboard/reset`,
        {}
      )
      .pipe(
        tap(() => {
          this.scoreboard$.next({
            xWins: 0,
            oWins: 0,
            draws: 0
          });
        })
      );
  }
}