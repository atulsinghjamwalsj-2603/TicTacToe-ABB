import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

import { GamePage } from './game-page';
import { GameMode } from '../../models/game-mode';
import { GameStatus } from '../../models/game-status';
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

describe('GamePage', () => {
  let component: GamePage;
  let fixture: ComponentFixture<GamePage>;
  let httpMock: HttpTestingController;

  // ngOnInit fires two things: game.createGame() (POST /games) AND, independently,
  // game.getScoreboard() (GET /scoreboard). createGame's own success callback then
  // triggers a SECOND getScoreboard() call. So three requests happen on init, in
  // this order of *completion* to avoid duplicate-pending-request errors:
  // GET /scoreboard (1st) -> POST /games -> GET /scoreboard (2nd, from createGame's callback).
  function flushInit(scoreboard = { xWins: 0, oWins: 0, draws: 0 }, state = makeState()) {
    const firstScoreboardReq = httpMock.expectOne('http://localhost:5273/api/scoreboard');
    firstScoreboardReq.flush(scoreboard);

    const createReq = httpMock.expectOne('http://localhost:5273/api/games');
    createReq.flush(state);

    const secondScoreboardReq = httpMock.expectOne('http://localhost:5273/api/scoreboard');
    secondScoreboardReq.flush(scoreboard);

    return { createReq };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamePage],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(GamePage);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges(); // triggers ngOnInit
    flushInit();
    expect(component).toBeTruthy();
  });

  // Covers acceptance criterion: "A new Tic Tac Toe game can be created"
  it('should create a new game in Two Player mode on load', () => {
    fixture.detectChanges();
    const { createReq } = flushInit();

    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body).toEqual({ mode: GameMode.TwoPlayer });
  });

  // Covers scoreboard display, served by the backend
  it('should display scoreboard values returned from the backend', () => {
    fixture.detectChanges();
    flushInit({ xWins: 2, oWins: 1, draws: 3 });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('X: 2');
    expect(text).toContain('O: 1');
    expect(text).toContain('Draws: 3');
  });

  // Covers TC-46 / TC-47 / TC-48: switching mode starts a fresh game
  it('should start a new game with the new mode when the mode dropdown changes', () => {
    fixture.detectChanges();
    flushInit();

    component.selectedMode = GameMode.VsComputer;
    component.onModeChange(new Event('change'));

    const createReq = httpMock.expectOne('http://localhost:5273/api/games');
    expect(createReq.request.body).toEqual({ mode: GameMode.VsComputer });
    createReq.flush(makeState({ mode: GameMode.VsComputer }));

    const scoreboardReq = httpMock.expectOne('http://localhost:5273/api/scoreboard');
    scoreboardReq.flush({ xWins: 0, oWins: 0, draws: 0 });
  });

  // Covers TC-43: Reset Scoreboard
  it('should reset the scoreboard when "Reset Scoreboard" is clicked', () => {
    fixture.detectChanges();
    flushInit({ xWins: 5, oWins: 4, draws: 1 });
    fixture.detectChanges();

    const resetButton = fixture.debugElement.query(By.css('.scoreboard-actions button'));
    resetButton.nativeElement.click();

    const resetReq = httpMock.expectOne('http://localhost:5273/api/scoreboard/reset');
    expect(resetReq.request.method).toBe('POST');
    resetReq.flush(null);

    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('X: 0');
    expect(text).toContain('O: 0');
    expect(text).toContain('Draws: 0');
  });
});
