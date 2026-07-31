namespace TicTacToe.Api.DTOs;

using TicTacToe.Api.Models;

public class CreateGameRequest
{
    public GameMode Mode { get; set; }
}