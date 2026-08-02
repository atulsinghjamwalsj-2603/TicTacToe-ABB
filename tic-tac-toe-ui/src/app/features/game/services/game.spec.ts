import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

// NOTE: the original stub imported a class called "Game" from './game', which
// does not exist - the class is exported as "GameService". That typo would
// have made this test file fail to compile.
import { GameService } from './game';
import { GameMode } from '../models/game-mode';
import { GameStatus } from '../models/game-status';
import { GameState } from '../models/game-state';

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    id: 'game-1',
    board: Array(9).fill(null),
    currentPlayer: 'X',
    status: GameStatus.InProgress,
    winner: null,
    mode: GameMode.TwoPlayer,
    moves: [],
    winningCombination: [],
    ...overrides
  };
}

describe('GameService', () => {
  let service: GameService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(GameService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createGame should POST to /games and update gameState$', () => {
    const mockState = makeState();

    service.createGame(GameMode.TwoPlayer).subscribe(result => {
      expect(result).toEqual(mockState);
    });

    const req = httpMock.expectOne('http://localhost:5273/api/games');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ mode: GameMode.TwoPlayer });
    req.flush(mockState);

    expect(service.gameState$.value).toEqual(mockState);
  });

  it('getGame should throw if no active game exists', () => {
    expect(() => service.getGame()).toThrowError('No active game exists.');
  });

  it('getGame should GET the current game and update gameState$', () => {
    service.gameState$.next(makeState());
    const updated = makeState({ currentPlayer: 'O' });

    service.getGame().subscribe(result => {
      expect(result).toEqual(updated);
    });

    const req = httpMock.expectOne('http://localhost:5273/api/games/game-1');
    expect(req.request.method).toBe('GET');
    req.flush(updated);

    expect(service.gameState$.value).toEqual(updated);
  });

  it('makeMove should throw if no active game exists', () => {
    expect(() => service.makeMove(0)).toThrowError('No active game exists.');
  });

  it('makeMove should POST the current player and position, and update gameState$', () => {
    service.gameState$.next(makeState({ currentPlayer: 'X' }));
    const updated = makeState({
      board: ['X', null, null, null, null, null, null, null, null],
      currentPlayer: 'O'
    });

    service.makeMove(0).subscribe(result => {
      expect(result).toEqual(updated);
    });

    const req = httpMock.expectOne('http://localhost:5273/api/games/game-1/moves');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ player: 'X', position: 0 });
    req.flush(updated);

    expect(service.gameState$.value).toEqual(updated);
  });

  it('undo should throw if no active game exists', () => {
    expect(() => service.undo()).toThrowError('No active game exists.');
  });

  it('undo should POST to /undo and update gameState$', () => {
    service.gameState$.next(makeState({ moves: [{ moveNumber: 1, player: 'X', position: 0 }] }));
    const updated = makeState();

    service.undo().subscribe(result => {
      expect(result).toEqual(updated);
    });

    const req = httpMock.expectOne('http://localhost:5273/api/games/game-1/undo');
    expect(req.request.method).toBe('POST');
    req.flush(updated);

    expect(service.gameState$.value).toEqual(updated);
  });

  it('resetGame should throw if no active game exists', () => {
    expect(() => service.resetGame()).toThrowError('No active game exists.');
  });

  it('resetGame should POST to /reset and update gameState$', () => {
    service.gameState$.next(makeState({ moves: [{ moveNumber: 1, player: 'X', position: 0 }] }));
    const updated = makeState();

    service.resetGame().subscribe(result => {
      expect(result).toEqual(updated);
    });

    const req = httpMock.expectOne('http://localhost:5273/api/games/game-1/reset');
    expect(req.request.method).toBe('POST');
    req.flush(updated);

    expect(service.gameState$.value).toEqual(updated);
  });

  it('getScoreboard should GET /scoreboard and update scoreboard$', () => {
    const mockScoreboard = { xWins: 3, oWins: 2, draws: 1 };

    service.getScoreboard().subscribe(result => {
      expect(result).toEqual(mockScoreboard);
    });

    const req = httpMock.expectOne('http://localhost:5273/api/scoreboard');
    expect(req.request.method).toBe('GET');
    req.flush(mockScoreboard);

    expect(service.scoreboard$.value).toEqual(mockScoreboard);
  });

  it('resetScoreboard should POST to /scoreboard/reset and zero out scoreboard$', () => {
    service.scoreboard$.next({ xWins: 5, oWins: 4, draws: 2 });

    service.resetScoreboard().subscribe();

    const req = httpMock.expectOne('http://localhost:5273/api/scoreboard/reset');
    expect(req.request.method).toBe('POST');
    req.flush(null);

    expect(service.scoreboard$.value).toEqual({ xWins: 0, oWins: 0, draws: 0 });
  });
});
