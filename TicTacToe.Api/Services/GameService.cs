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
            Status = GameStatus.InProgress,
            WinningCombination = null,
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

        if (game.Status != GameStatus.InProgress) return game;
        if (game.CurrentPlayer != player) return game;
        if (position < 0 || position > 8) return game;
        if (!string.IsNullOrEmpty(game.Board[position])) return game;

        game.Board[position] = player;

        game.Moves.Add(new Move
        {
            MoveNumber = game.Moves.Count + 1,
            Player = player,
            Position = position
        });

        CheckWinner(game);

        if (game.Status == GameStatus.InProgress)
        {
            game.CurrentPlayer = player == "X" ? "O" : "X";
        }

        if (game.Mode == GameMode.VsComputer &&
            game.CurrentPlayer == "O" &&
            game.Status == GameStatus.InProgress)
        {
            MakeComputerMove(game);
        }

        return game;
    }

    private void CheckWinner(GameState game)
    {
        int[][] winPatterns = new int[][]
        {
            new[] {0,1,2}, new[] {3,4,5}, new[] {6,7,8},
            new[] {0,3,6}, new[] {1,4,7}, new[] {2,5,8},
            new[] {0,4,8}, new[] {2,4,6}
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
                game.WinningCombination = new List<int> { pattern[0], pattern[1], pattern[2] };

                if (a == "X") _scoreboard.XWins++;
                else _scoreboard.OWins++;

                return;
            }
        }

        if (game.Board.All(x => !string.IsNullOrEmpty(x)))
        {
            game.Status = GameStatus.Draw;
            _scoreboard.Draws++;
        }
    }

    // 🔥 SMART AI IMPLEMENTATION
    private void MakeComputerMove(GameState game)
    {
        var available = GetAvailableMoves(game.Board);
        if (!available.Any()) return;

        // 1. Win
        var winMove = FindWinningMove(game, "O");
        if (winMove.HasValue)
        {
            ApplyMove(game, winMove.Value, "O");
            return;
        }

        // 2. Block
        var blockMove = FindWinningMove(game, "X");
        if (blockMove.HasValue)
        {
            ApplyMove(game, blockMove.Value, "O");
            return;
        }

        // 3. Center
        if (available.Contains(4))
        {
            ApplyMove(game, 4, "O");
            return;
        }

        // 4. Corners
        int[] corners = { 0, 2, 6, 8 };
        var corner = corners.FirstOrDefault(c => available.Contains(c));
        if (available.Contains(corner))
        {
            ApplyMove(game, corner, "O");
            return;
        }

        // 5. Fallback
        ApplyMove(game, available.First(), "O");
    }

    private List<int> GetAvailableMoves(string[] board)
    {
        return board
            .Select((val, idx) => new { val, idx })
            .Where(x => string.IsNullOrEmpty(x.val))
            .Select(x => x.idx)
            .ToList();
    }

    private int? FindWinningMove(GameState game, string player)
    {
        int[][] winPatterns = new int[][]
        {
            new[] {0,1,2}, new[] {3,4,5}, new[] {6,7,8},
            new[] {0,3,6}, new[] {1,4,7}, new[] {2,5,8},
            new[] {0,4,8}, new[] {2,4,6}
        };

        foreach (var pattern in winPatterns)
        {
            var values = pattern.Select(i => game.Board[i]).ToArray();

            int playerCount = values.Count(v => v == player);
            int emptyCount = values.Count(string.IsNullOrEmpty);

            if (playerCount == 2 && emptyCount == 1)
            {
                return pattern.First(i => string.IsNullOrEmpty(game.Board[i]));
            }
        }

        return null;
    }

    private void ApplyMove(GameState game, int position, string player)
    {
        game.Board[position] = player;

        game.Moves.Add(new Move
        {
            MoveNumber = game.Moves.Count + 1,
            Player = player,
            Position = position
        });

        CheckWinner(game);

        if (game.Status == GameStatus.InProgress)
        {
            game.CurrentPlayer = player == "O" ? "X" : "O";
        }
    }

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

    public GameState? ResetGame(Guid id)
    {
        if (!_games.ContainsKey(id)) return null;

        var game = _games[id];

        game.Board = new string[9];
        game.Moves.Clear();
        game.CurrentPlayer = "X";
        game.Status = GameStatus.InProgress;
        game.Winner = null;
        game.WinningCombination = null;

        return game;
    }

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