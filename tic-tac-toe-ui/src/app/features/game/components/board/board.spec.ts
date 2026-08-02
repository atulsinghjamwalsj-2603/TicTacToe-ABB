import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

import { Board } from './board';
import { GameService } from '../../services/game';
import { GameStatus } from '../../models/game-status';
import { GameMode } from '../../models/game-mode';
import { GameState } from '../../models/game-state';

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

describe('Board', () => {
  let component: Board;
  let fixture: ComponentFixture<Board>;
  let game: GameService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Board],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(Board);
    component = fixture.componentInstance;
    game = TestBed.inject(GameService);
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => {
    // Fails the test if any expected HTTP call was never made/flushed.
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Covers TC-01: renders a 3x3 (9-cell) grid
  it('should render 9 cells for a fresh game', () => {
    game.gameState$.next(makeState());
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('app-cell')).length).toBe(9);
  });

  // Covers TC-33: Undo disabled with no moves
  it('should disable Undo when there are no moves', () => {
    game.gameState$.next(makeState({ moves: [] }));
    fixture.detectChanges();

    const undoButton = fixture.debugElement.query(By.css('button.undo'));
    expect(undoButton.nativeElement.disabled).toBe(true);
  });

  // Covers TC-34: Undo enabled after a move
  it('should enable Undo once a move exists', () => {
    game.gameState$.next(makeState({ moves: [{ moveNumber: 1, player: 'X', position: 0 }] }));
    fixture.detectChanges();

    const undoButton = fixture.debugElement.query(By.css('button.undo'));
    expect(undoButton.nativeElement.disabled).toBe(false);
  });

  // Covers TC-16 / TC-20: Undo disabled once the game is completed, even with moves present
  it('should disable Undo once the game is won or drawn', () => {
    game.gameState$.next(makeState({
      status: GameStatus.Won,
      winner: 'X',
      moves: [{ moveNumber: 1, player: 'X', position: 0 }]
    }));
    fixture.detectChanges();

    const undoButton = fixture.debugElement.query(By.css('button.undo'));
    expect(undoButton.nativeElement.disabled).toBe(true);
  });

  // Covers TC-28: move history hidden when there are no moves
  it('should hide the move history table when there are no moves', () => {
    game.gameState$.next(makeState({ moves: [] }));
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.moves table'))).toBeNull();
  });

  // Covers TC-29 / TC-30: move history appears and lists rows
  it('should show one move-history row per move', () => {
    game.gameState$.next(makeState({
      moves: [
        { moveNumber: 1, player: 'X', position: 0 },
        { moveNumber: 2, player: 'O', position: 4 }
      ]
    }));
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('.moves tbody tr'));
    expect(rows.length).toBe(2);
  });

  // Covers TC-31: position-to-text mapping
  it('should map board positions to "Row, Column" text correctly', () => {
    expect(component.getPositionText(0)).toBe('Row 1, Column 1');
    expect(component.getPositionText(4)).toBe('Row 2, Column 2');
    expect(component.getPositionText(8)).toBe('Row 3, Column 3');
  });

  // Covers TC-02: clicking an empty cell sends a move request
  it('should call the moves API when an empty cell is clicked', () => {
    game.gameState$.next(makeState());
    fixture.detectChanges();

    const firstCellButton = fixture.debugElement.query(By.css('app-cell button.cell'));
    firstCellButton.nativeElement.click();

    const req = httpMock.expectOne('http://localhost:5273/api/games/game-1/moves');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ player: 'X', position: 0 });

    req.flush(makeState({
      board: ['X', null, null, null, null, null, null, null, null],
      currentPlayer: 'O',
      moves: [{ moveNumber: 1, player: 'X', position: 0 }]
    }));
  });

  // Covers TC-16 / TC-20: no move request once the game is already completed
  it('should not call the moves API when the game is already completed', () => {
    game.gameState$.next(makeState({ status: GameStatus.Won, winner: 'X' }));
    fixture.detectChanges();

    component.makeMove(1);

    httpMock.expectNone('http://localhost:5273/api/games/game-1/moves');
  });

  // Covers TC-04: no move request for an already-filled cell
  it('should not call the moves API for an already-filled cell', () => {
    game.gameState$.next(makeState({ board: ['X', null, null, null, null, null, null, null, null] }));
    fixture.detectChanges();

    component.makeMove(0);

    httpMock.expectNone('http://localhost:5273/api/games/game-1/moves');
  });

  // Covers TC-22 / TC-26: Reset Game calls the reset API and then refreshes the scoreboard
  it('should call the reset API when Reset Game is clicked', () => {
    game.gameState$.next(makeState({ moves: [{ moveNumber: 1, player: 'X', position: 0 }] }));
    fixture.detectChanges();

    const resetButton = fixture.debugElement.query(By.css('button.reset'));
    resetButton.nativeElement.click();

    const resetReq = httpMock.expectOne('http://localhost:5273/api/games/game-1/reset');
    expect(resetReq.request.method).toBe('POST');
    resetReq.flush(makeState());

    const scoreboardReq = httpMock.expectOne('http://localhost:5273/api/scoreboard');
    scoreboardReq.flush({ xWins: 0, oWins: 0, draws: 0 });
  });

  // Covers TC-35 / TC-36: Undo calls the undo API
  it('should call the undo API when Undo Last Move is clicked', () => {
    game.gameState$.next(makeState({ moves: [{ moveNumber: 1, player: 'X', position: 0 }] }));
    fixture.detectChanges();

    const undoButton = fixture.debugElement.query(By.css('button.undo'));
    undoButton.nativeElement.click();

    const req = httpMock.expectOne('http://localhost:5273/api/games/game-1/undo');
    expect(req.request.method).toBe('POST');
    req.flush(makeState());
  });
});
