namespace TicTacToe.Api.DTOs;

public class MakeMoveRequest
{
    public string Player { get; set; } = "";
    public int Position { get; set; }
}