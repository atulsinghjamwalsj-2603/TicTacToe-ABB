namespace TicTacToe.Api.Models;

public enum GameStatus
{
    InProgress,
    Won,
    Draw
}

public enum GameMode
{
    TwoPlayer,
    VsComputer
}

public class GameState
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string[] Board { get; set; } = new string[9];
    public string CurrentPlayer { get; set; } = "X";
    public GameStatus Status { get; set; } = GameStatus.InProgress;
    public string? Winner { get; set; }
    public GameMode Mode { get; set; } = GameMode.TwoPlayer;
    public List<int>? WinningCombination { get; set; }
    public List<Move> Moves { get; set; } = new();
}