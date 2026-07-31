using TicTacToe.Api.Models;

namespace TicTacToe.Api.Services;

public class GameService
{
    private readonly Dictionary<Guid, GameState> _games = new();
    private readonly Scoreboard _scoreboard = new();

    public GameState CreateGame(GameMode mode)
    {
        var game = new GameState
        {
            Mode = mode,
            Board = new string[9],
            CurrentPlayer = "X",
            Status = GameStatus.InProgress
        };

        _games[game.Id] = game;
        return game;
    }

    public GameState? GetGame(Guid id)
    {
        return _games.ContainsKey(id) ? _games[id] : null;
    }

    public GameState? MakeMove(Guid id, string player, int position)
    {
        if (!_games.ContainsKey(id)) return null;

        var game = _games[id];

        // validations
        if (game.Status != GameStatus.InProgress) return game;
        if (game.CurrentPlayer != player) return game;
        if (position < 0 || position > 8) return game;
        if (!string.IsNullOrEmpty(game.Board[position])) return game;

        // apply move
        game.Board[position] = player;

        game.Moves.Add(new Move
        {
            MoveNumber = game.Moves.Count + 1,
            Player = player,
            Position = position
        });

        // Check winner
        CheckWinner(game);

        // Switch player
        if (game.Status == GameStatus.InProgress)
        {
            game.CurrentPlayer = player == "X" ? "O" : "X";
        }

        // Computer move
        if (game.Mode == GameMode.VsComputer &&
            game.CurrentPlayer == "O" &&
            game.Status == GameStatus.InProgress)
        {
            MakeComputerMove(game);
        }

        return game;
    }

    // Winner logic
    private void CheckWinner(GameState game)
    {
        int[][] winPatterns = new int[][]
        {
            new[] {0,1,2},
            new[] {3,4,5},
            new[] {6,7,8},
            new[] {0,3,6},
            new[] {1,4,7},
            new[] {2,5,8},
            new[] {0,4,8},
            new[] {2,4,6}
        };

        foreach (var pattern in winPatterns)
        {
            var a = game.Board[pattern[0]];
            var b = game.Board[pattern[1]];
            var c = game.Board[pattern[2]];

            if (!string.IsNullOrEmpty(a) && a == b && b == c)
            {
                game.Status = GameStatus.Won;
                game.Winner = a;

                if (a == "X") _scoreboard.XWins++;
                else _scoreboard.OWins++;

                return;
            }
        }

        // Draw
        if (game.Board.All(x => !string.IsNullOrEmpty(x)))
        {
            game.Status = GameStatus.Draw;
            _scoreboard.Draws++;
        }
    }

    // Basic Computer AI
    private void MakeComputerMove(GameState game)
    {
        var available = game.Board
            .Select((val, idx) => new { val, idx })
            .Where(x => string.IsNullOrEmpty(x.val))
            .Select(x => x.idx)
            .ToList();

        if (!available.Any()) return;

        int move = available.First(); // simple logic (can improve later)

        game.Board[move] = "O";

        game.Moves.Add(new Move
        {
            MoveNumber = game.Moves.Count + 1,
            Player = "O",
            Position = move
        });

        CheckWinner(game);

        if (game.Status == GameStatus.InProgress)
        {
            game.CurrentPlayer = "X";
        }
    }

    // Undo
    public GameState? Undo(Guid id)
    {
        if (!_games.ContainsKey(id)) return null;

        var game = _games[id];

        if (game.Moves.Count == 0) return game;

        if (game.Mode == GameMode.TwoPlayer)
        {
            UndoSingleMove(game);
        }
        else
        {
            if (game.Moves.Count >= 2)
            {
                UndoSingleMove(game);
                UndoSingleMove(game);
            }
        }

        game.Status = GameStatus.InProgress;
        game.Winner = null;

        return game;
    }

    private void UndoSingleMove(GameState game)
    {
        var lastMove = game.Moves.Last();

        game.Board[lastMove.Position] = null;
        game.Moves.Remove(lastMove);

        game.CurrentPlayer = lastMove.Player;
    }

    // Reset Game
    public GameState? ResetGame(Guid id)
    {
        if (!_games.ContainsKey(id)) return null;

        var game = _games[id];

        game.Board = new string[9];
        game.Moves.Clear();
        game.CurrentPlayer = "X";
        game.Status = GameStatus.InProgress;
        game.Winner = null;

        return game;
    }

    // Scoreboard
    public Scoreboard GetScoreboard()
    {
        return _scoreboard;
    }

    public void ResetScoreboard()
    {
        _scoreboard.XWins = 0;
        _scoreboard.OWins = 0;
        _scoreboard.Draws = 0;
    }
}