namespace TicTacToe.Api.Models;

public class Move
{
    public int MoveNumber { get; set; }
    public string Player { get; set; } = "";
    public int Position { get; set; } // 0–8
}