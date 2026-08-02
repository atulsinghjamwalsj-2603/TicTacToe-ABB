import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

import { Status } from './status';
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

describe('Status', () => {
  let component: Status;
  let fixture: ComponentFixture<Status>;
  let game: GameService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Status],
      // Status injects GameService, which injects HttpClient - both must be
      // provided even though this component never triggers a request itself.
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(Status);
    component = fixture.componentInstance;
    game = TestBed.inject(GameService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Nothing to show before a game exists yet
  it('should render nothing when there is no active game state', () => {
    fixture.detectChanges();
    const status = fixture.debugElement.query(By.css('.status'));
    expect(status).toBeNull();
  });

  // Covers TC-07 / TC-08 / TC-09: Two Player Mode turn text
  it('should display "Current Player: X" in Two Player mode', () => {
    game.gameState$.next(makeState({ currentPlayer: 'X', mode: GameMode.TwoPlayer }));
    fixture.detectChanges();

    expect((fixture.nativeElement.textContent as string)).toContain('Current Player: X');
  });

  it('should display "Current Player: O" in Two Player mode', () => {
    game.gameState$.next(makeState({ currentPlayer: 'O', mode: GameMode.TwoPlayer }));
    fixture.detectChanges();

    expect((fixture.nativeElement.textContent as string)).toContain('Current Player: O');
  });

  // Covers TC-11: Computer Mode turn text
  it('should display "Your Turn" in Computer mode when it is the human\'s (X) turn', () => {
    game.gameState$.next(makeState({ currentPlayer: 'X', mode: GameMode.VsComputer }));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Your Turn');
    expect(text).not.toContain('Current Player');
  });

  it('should display "Computer\'s Turn" in Computer mode when it is O\'s turn', () => {
    game.gameState$.next(makeState({ currentPlayer: 'O', mode: GameMode.VsComputer }));
    fixture.detectChanges();

    expect((fixture.nativeElement.textContent as string)).toContain("Computer's Turn");
  });

  // Covers TC-12 to TC-15: winner message
  it('should display the winner message when the game is won', () => {
    game.gameState$.next(makeState({ status: GameStatus.Won, winner: 'X' }));
    fixture.detectChanges();

    expect((fixture.nativeElement.textContent as string)).toContain('Winner: X');
  });

  // Covers TC-19: draw message
  it('should display the draw message when the game is a draw', () => {
    game.gameState$.next(makeState({ status: GameStatus.Draw }));
    fixture.detectChanges();

    expect((fixture.nativeElement.textContent as string)).toContain('Game Draw!');
  });
});
